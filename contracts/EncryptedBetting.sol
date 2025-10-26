// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint64, externalEuint8, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPredictionMarketCore {
    function getMarketStatus(uint256 marketId) external view returns (uint8);
    function addBettor(uint256 marketId, address bettor) external;
    function updateTotalPool(uint256 marketId, uint256 amount) external;
}

/// @title Encrypted Betting - FHE Bet Management
/// @notice Handles encrypted bet placement and storage
contract EncryptedBetting is SepoliaConfig, ReentrancyGuard {

    struct Bet {
        euint8 option;
        euint64 amount;
        bool claimed;
        uint64 timestamp;
    }

    struct OptionPool {
        euint64 totalAmount;
        bool initialized;
    }

    IPredictionMarketCore public marketCore;

    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => mapping(uint8 => OptionPool)) public optionPools;

    event BetPlaced(uint256 indexed marketId, address indexed bettor, uint64 timestamp);
    event BetRefunded(uint256 indexed marketId, address indexed bettor, uint256 amount);

    constructor(address _marketCore) {
        marketCore = IPredictionMarketCore(_marketCore);
    }

    /// @notice Place encrypted bet
    function placeBet(
        uint256 marketId,
        externalEuint8 encryptedOption,
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external payable nonReentrant {
        require(marketCore.getMarketStatus(marketId) == 0, "Market not active"); // 0 = Active
        require(bets[marketId][msg.sender].timestamp == 0, "Already bet");
        require(msg.value > 0, "Must send ETH");

        // Verify and convert encrypted inputs
        euint8 option = FHE.fromExternal(encryptedOption, proof);
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        // Store encrypted bet
        bets[marketId][msg.sender] = Bet({
            option: option,
            amount: amount,
            claimed: false,
            timestamp: uint64(block.timestamp)
        });

        // Update pools using FHE computation
        _updateOptionPools(marketId, option, amount);

        // Grant ACL permissions
        FHE.allowThis(option);
        FHE.allowThis(amount);
        FHE.allow(option, msg.sender);
        FHE.allow(amount, msg.sender);

        // Update market core
        marketCore.addBettor(marketId, msg.sender);
        marketCore.updateTotalPool(marketId, msg.value);

        emit BetPlaced(marketId, msg.sender, uint64(block.timestamp));
    }

    /// @notice Update option pools with encrypted computation
    function _updateOptionPools(uint256 marketId, euint8 option, euint64 amount) internal {
        // Iterate through possible options (0-9)
        for (uint8 i = 0; i < 10; i++) {
            ebool isThisOption = FHE.eq(option, FHE.asEuint8(i));
            euint64 addAmount = FHE.select(isThisOption, amount, FHE.asEuint64(0));

            OptionPool storage pool = optionPools[marketId][i];
            if (!pool.initialized) {
                pool.totalAmount = addAmount;
                pool.initialized = true;
            } else {
                pool.totalAmount = FHE.add(pool.totalAmount, addAmount);
            }

            FHE.allowThis(pool.totalAmount);
        }
    }

    /// @notice Refund bet if market cancelled
    function refundBet(uint256 marketId) external nonReentrant {
        require(marketCore.getMarketStatus(marketId) == 4, "Market not cancelled"); // 4 = Cancelled

        Bet storage bet = bets[marketId][msg.sender];
        require(bet.timestamp > 0, "No bet");
        require(!bet.claimed, "Already refunded");

        bet.claimed = true;

        // Transfer back the ETH
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Transfer failed");

        emit BetRefunded(marketId, msg.sender, address(this).balance);
    }

    /// @notice Get user bet (encrypted)
    function getUserBet(uint256 marketId, address user) external view returns (
        euint8 option,
        euint64 amount,
        bool claimed,
        uint64 timestamp
    ) {
        Bet storage bet = bets[marketId][user];
        return (bet.option, bet.amount, bet.claimed, bet.timestamp);
    }

    /// @notice Get option pool (encrypted)
    function getOptionPool(uint256 marketId, uint8 optionId) external view returns (euint64) {
        return optionPools[marketId][optionId].totalAmount;
    }

    /// @notice Mark bet as claimed
    function markClaimed(uint256 marketId, address user) external {
        bets[marketId][user].claimed = true;
    }
}
