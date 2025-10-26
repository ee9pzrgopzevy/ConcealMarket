// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Gateway} from "@fhevm/solidity/gateway/Gateway.sol";
import {FHE, euint8, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
/// @notice Handles Gateway decryption and payout distribution
contract SettlementEngine is SepoliaConfig, ReentrancyGuard {

    IEncryptedBetting public bettingContract;
    IPredictionMarketCore public marketCore;

    uint256 public platformFeePercent = 2;

    mapping(uint256 => uint256) public winningPoolPublic;
    mapping(uint256 => bool) public poolDecrypted;

    // Gateway request tracking
    mapping(uint256 => uint256) public requestToMarket;
    mapping(uint256 => address) public requestToUser;
    mapping(uint256 => RequestType) public requestTypes;

    enum RequestType { PoolDecryption, OptionCheck, AmountDecryption }

    event PoolDecrypted(uint256 indexed marketId, uint256 winningPool);
    event DecryptionRequested(uint256 indexed marketId, address indexed user, uint256 requestId);
    event PayoutProcessed(uint256 indexed marketId, address indexed winner, uint256 amount);

    constructor(address _bettingContract, address _marketCore) {
        bettingContract = IEncryptedBetting(_bettingContract);
        marketCore = IPredictionMarketCore(_marketCore);
    }

    /// @notice Request winning pool decryption
    function requestPoolDecryption(uint256 marketId) external returns (uint256) {
        (, , , , uint8 status, uint8 winningOption, ) = marketCore.getMarket(marketId);
        require(status == 2, "Not settled"); // 2 = Settled
        require(!poolDecrypted[marketId], "Already decrypted");

        euint64 winningPool = bettingContract.getOptionPool(marketId, winningOption);

        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(winningPool);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackPoolDecryption.selector,
            0,
            block.timestamp + 100,
            false
        );

        requestToMarket[requestId] = marketId;
        requestTypes[requestId] = RequestType.PoolDecryption;

        return requestId;
    }

    /// @notice Callback for pool decryption
    function callbackPoolDecryption(uint256 requestId, uint64 decryptedPool) public onlyGateway {
        uint256 marketId = requestToMarket[requestId];

        winningPoolPublic[marketId] = decryptedPool;
        poolDecrypted[marketId] = true;

        emit PoolDecrypted(marketId, decryptedPool);
    }

    /// @notice Request winnings claim (two-stage decryption)
    function requestWinningsClaim(uint256 marketId) external returns (uint256) {
        (, , , , uint8 status, , ) = marketCore.getMarket(marketId);
        require(status == 2, "Not settled");
        require(poolDecrypted[marketId], "Pool not decrypted");

        (euint8 option, , bool claimed, uint64 timestamp) = bettingContract.getUserBet(marketId, msg.sender);
        require(timestamp > 0, "No bet");
        require(!claimed, "Already claimed");

        // Step 1: Decrypt option to check if winner
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(option);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackCheckWinner.selector,
            0,
            block.timestamp + 100,
            false
        );

        requestToMarket[requestId] = marketId;
        requestToUser[requestId] = msg.sender;
        requestTypes[requestId] = RequestType.OptionCheck;

        emit DecryptionRequested(marketId, msg.sender, requestId);
        return requestId;
    }

    /// @notice Callback to check if user is winner
    function callbackCheckWinner(uint256 requestId, uint8 decryptedOption) public onlyGateway {
        uint256 marketId = requestToMarket[requestId];
        address user = requestToUser[requestId];

        (, , , , , uint8 winningOption, ) = marketCore.getMarket(marketId);

        if (decryptedOption == winningOption) {
            // Step 2: Decrypt amount for payout calculation
            (, euint64 amount, , ) = bettingContract.getUserBet(marketId, user);

            uint256[] memory cts = new uint256[](1);
            cts[0] = Gateway.toUint256(amount);

            uint256 amountRequestId = Gateway.requestDecryption(
                cts,
                this.callbackProcessPayout.selector,
                0,
                block.timestamp + 100,
                false
            );

            requestToMarket[amountRequestId] = marketId;
            requestToUser[amountRequestId] = user;
            requestTypes[amountRequestId] = RequestType.AmountDecryption;
        }
    }

    /// @notice Callback to process payout
    function callbackProcessPayout(uint256 requestId, uint64 decryptedAmount) public onlyGateway nonReentrant {
        uint256 marketId = requestToMarket[requestId];
        address user = requestToUser[requestId];

        (, , , , , , uint256 totalPool) = marketCore.getMarket(marketId);

        // Calculate payout
        uint256 userShare = (uint256(decryptedAmount) * totalPool * (100 - platformFeePercent))
                          / (winningPoolPublic[marketId] * 100);

        require(userShare > 0, "No payout");
        require(address(this).balance >= userShare, "Insufficient balance");

        bettingContract.markClaimed(marketId, user);

        (bool success, ) = payable(user).call{value: userShare}("");
        require(success, "Transfer failed");

        emit PayoutProcessed(marketId, user, userShare);
    }

    /// @notice Update platform fee
    function setPlatformFee(uint256 newFeePercent) external {
        require(newFeePercent <= 10, "Fee too high");
        platformFeePercent = newFeePercent;
    }

    /// @notice Receive ETH
    receive() external payable {}
}
