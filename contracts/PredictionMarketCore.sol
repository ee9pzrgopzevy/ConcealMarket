// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Prediction Market Core - Market Management
/// @notice Manages market creation, lifecycle, and oracle control (plaintext)
contract PredictionMarketCore is Ownable {

    enum MarketStatus { Active, Closed, Settled, Cancelled }

    struct Market {
        address creator;
        string question;
        string[] options;
        string category;
        uint64 endTime;
        address oracle;
        MarketStatus status;
        uint8 winningOption;
        uint256 totalPoolPublic;
        uint256 createdAt;
        uint256 minBetAmount;
        uint256 maxBetAmount;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => address[]) public marketBettors;
    mapping(address => uint256[]) public userCreatedMarkets;

    uint256 public nextMarketId;
    uint256 public marketCreationFee = 0.01 ether;

    event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint8 optionCount, uint64 endTime);
    event MarketClosed(uint256 indexed marketId, uint64 closedAt);
    event MarketSettled(uint256 indexed marketId, uint8 winningOption);
    event MarketCancelled(uint256 indexed marketId, string reason);
    event OracleChanged(uint256 indexed marketId, address indexed newOracle);

    constructor() Ownable(msg.sender) {}

    /// @notice Create a new prediction market (anyone can create)
    function createMarket(
        string calldata question,
        string[] calldata options,
        string calldata category,
        uint64 endTime,
        uint256 minBetAmount,
        uint256 maxBetAmount
    ) external payable returns (uint256) {
        require(msg.value >= marketCreationFee, "Insufficient creation fee");
        require(options.length >= 2 && options.length <= 10, "Invalid option count");
        require(endTime > block.timestamp + 1 hours, "End time too soon");
        require(endTime <= block.timestamp + 365 days, "End time too far");
        require(minBetAmount > 0, "Min bet must be > 0");
        require(maxBetAmount >= minBetAmount, "Max < min");

        uint256 marketId = nextMarketId++;
        Market storage m = markets[marketId];
        m.creator = msg.sender;
        m.question = question;
        m.options = options;
        m.category = category;
        m.endTime = endTime;
        m.oracle = msg.sender; // Creator is default oracle
        m.status = MarketStatus.Active;
        m.createdAt = block.timestamp;
        m.minBetAmount = minBetAmount;
        m.maxBetAmount = maxBetAmount;

        userCreatedMarkets[msg.sender].push(marketId);

        emit MarketCreated(marketId, msg.sender, question, uint8(options.length), endTime);
        return marketId;
    }

    /// @notice Change oracle address (creator only)
    function changeOracle(uint256 marketId, address newOracle) external {
        Market storage m = markets[marketId];
        require(msg.sender == m.creator, "Not creator");
        require(m.status == MarketStatus.Active, "Not active");
        require(newOracle != address(0), "Invalid oracle");

        m.oracle = newOracle;
        emit OracleChanged(marketId, newOracle);
    }

    /// @notice Close market (oracle only)
    function closeMarket(uint256 marketId) external {
        Market storage m = markets[marketId];
        require(msg.sender == m.oracle, "Not oracle");
        require(m.status == MarketStatus.Active, "Not active");
        require(block.timestamp >= m.endTime, "Not ended");

        m.status = MarketStatus.Closed;
        emit MarketClosed(marketId, uint64(block.timestamp));
    }

    /// @notice Settle market with winning option (oracle only)
    function settleMarket(uint256 marketId, uint8 winningOption) external {
        Market storage m = markets[marketId];
        require(msg.sender == m.oracle, "Not oracle");
        require(m.status == MarketStatus.Closed, "Not closed");
        require(winningOption < m.options.length, "Invalid option");

        m.status = MarketStatus.Settled;
        m.winningOption = winningOption;

        emit MarketSettled(marketId, winningOption);
    }

    /// @notice Cancel market (creator or owner, before settlement)
    function cancelMarket(uint256 marketId, string calldata reason) external {
        Market storage m = markets[marketId];
        require(msg.sender == m.creator || msg.sender == owner(), "Not authorized");
        require(m.status != MarketStatus.Settled, "Already settled");

        m.status = MarketStatus.Cancelled;
        emit MarketCancelled(marketId, reason);
    }

    /// @notice Set market creation fee (owner only)
    function setMarketCreationFee(uint256 newFee) external onlyOwner {
        marketCreationFee = newFee;
    }

    /// @notice Withdraw creation fees (owner only)
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /// @notice Add bettor to market (called by betting contract)
    function addBettor(uint256 marketId, address bettor) external {
        marketBettors[marketId].push(bettor);
    }

    /// @notice Update total pool (called by betting contract)
    function updateTotalPool(uint256 marketId, uint256 amount) external {
        markets[marketId].totalPoolPublic += amount;
    }

    /// @notice Get market details
    function getMarket(uint256 marketId) external view returns (
        address creator,
        string memory question,
        string[] memory options,
        string memory category,
        uint64 endTime,
        address oracle,
        MarketStatus status,
        uint8 winningOption,
        uint256 totalPool,
        uint256 minBet,
        uint256 maxBet
    ) {
        Market storage m = markets[marketId];
        return (
            m.creator,
            m.question,
            m.options,
            m.category,
            m.endTime,
            m.oracle,
            m.status,
            m.winningOption,
            m.totalPoolPublic,
            m.minBetAmount,
            m.maxBetAmount
        );
    }

    /// @notice Get bettor count
    function getBettorCount(uint256 marketId) external view returns (uint256) {
        return marketBettors[marketId].length;
    }

    /// @notice Get market status
    function getMarketStatus(uint256 marketId) external view returns (MarketStatus) {
        return markets[marketId].status;
    }

    /// @notice Get markets created by user
    function getUserCreatedMarkets(address user) external view returns (uint256[] memory) {
        return userCreatedMarkets[user];
    }

    /// @notice Get market bet limits
    function getMarketLimits(uint256 marketId) external view returns (uint256 min, uint256 max) {
        Market storage m = markets[marketId];
        return (m.minBetAmount, m.maxBetAmount);
    }

    /// @notice Get all active markets (up to 100)
    function getActiveMarkets() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextMarketId && count < 100; i++) {
            if (markets[i].status == MarketStatus.Active) {
                count++;
            }
        }

        uint256[] memory activeIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextMarketId && index < count; i++) {
            if (markets[i].status == MarketStatus.Active) {
                activeIds[index] = i;
                index++;
            }
        }

        return activeIds;
    }
}
