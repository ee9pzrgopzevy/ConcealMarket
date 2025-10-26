// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint64} from "@fhevm/solidity/lib/FHE.sol";

interface IEncryptedBetting {
    function getUserBet(uint256 marketId, address user) external view returns (euint8, euint64, bool, uint64);
    function getOptionPool(uint256 marketId, uint8 optionId) external view returns (euint64);
    function markClaimed(uint256 marketId, address user) external;
}

interface IPredictionMarketCore {
    function getMarket(uint256 marketId) external view returns (
        string memory, string[] memory, uint64, address, uint8, uint8, uint256
    );
}

/// @title Settlement Engine - Payout Calculation
/// @notice Handles settlement and payout distribution for prediction markets
contract SettlementEngine {

    IEncryptedBetting public bettingContract;
    IPredictionMarketCore public marketCore;

    uint256 public platformFeePercent = 2;
    address public owner;

    mapping(uint256 => uint256) public winningPoolPublic;
    mapping(uint256 => bool) public poolSettled;

    event MarketSettled(uint256 indexed marketId, uint256 winningPool);
    event PayoutClaimed(uint256 indexed marketId, address indexed winner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _marketCore, address _bettingContract) {
        marketCore = IPredictionMarketCore(_marketCore);
        bettingContract = IEncryptedBetting(_bettingContract);
        owner = msg.sender;
    }

    /// @notice Oracle settles market and decrypts winning pool
    /// @dev In production, this would be called by Gateway callback
    function settleMarket(uint256 marketId, uint256 decryptedWinningPool) external onlyOwner {
        (, , , , uint8 status, , ) = marketCore.getMarket(marketId);
        require(status == 2, "Market not settled"); // 2 = Settled
        require(!poolSettled[marketId], "Already settled");

        winningPoolPublic[marketId] = decryptedWinningPool;
        poolSettled[marketId] = true;

        emit MarketSettled(marketId, decryptedWinningPool);
    }

    /// @notice Owner processes payout for a user after off-chain decryption
    /// @dev In production, this would use Gateway for automatic decryption
    function processPayout(
        uint256 marketId,
        address user,
        uint256 userAmount
    ) external onlyOwner {
        (, , , , uint8 status, , uint256 totalPool) = marketCore.getMarket(marketId);
        require(status == 2, "Not settled");
        require(poolSettled[marketId], "Pool not settled");

        (, , bool claimed, uint64 timestamp) = bettingContract.getUserBet(marketId, user);
        require(timestamp > 0, "No bet");
        require(!claimed, "Already claimed");
        require(userAmount > 0, "Invalid amount");

        // Calculate payout: (userAmount / winningPool) * totalPool * (1 - fee)
        uint256 userShare = (userAmount * totalPool * (100 - platformFeePercent))
                          / (winningPoolPublic[marketId] * 100);

        require(userShare > 0, "No payout");
        require(address(this).balance >= userShare, "Insufficient balance");

        // Mark as claimed
        bettingContract.markClaimed(marketId, user);

        // Transfer winnings
        (bool success, ) = payable(user).call{value: userShare}("");
        require(success, "Transfer failed");

        emit PayoutClaimed(marketId, user, userShare);
    }

    /// @notice Update platform fee
    function setPlatformFee(uint256 newFeePercent) external {
        require(newFeePercent <= 10, "Fee too high");
        platformFeePercent = newFeePercent;
    }

    /// @notice Receive ETH
    receive() external payable {}
}
