const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper to get block timestamp
async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

describe("PredictionMarketCore - Market Management Tests", function () {
  let contract;
  let owner, creator, oracle, user1, user2;

  beforeEach(async function () {
    [owner, creator, oracle, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("PredictionMarketCore");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  describe("Deployment", function () {
    it("should deploy contract successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
      console.log("  Contract deployed at:", await contract.getAddress());
    });

    it("should have correct initial state", async function () {
      const nextMarketId = await contract.nextMarketId();
      const contractOwner = await contract.owner();

      expect(nextMarketId).to.equal(0);
      expect(contractOwner).to.equal(owner.address);
      console.log("  Initial state verified");
    });
  });

  describe("Market Creation", function () {
    it("should create a market successfully (free, only gas)", async function () {
      const question = "Will BTC reach $100k?";
      const options = ["Yes", "No"];
      const category = "Crypto";
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7; // 7 days from now
      const minBet = ethers.parseEther("0.01");
      const maxBet = ethers.parseEther("10");

      const tx = await contract.connect(creator).createMarket(
        question,
        options,
        category,
        endTime,
        minBet,
        maxBet
      );

      const receipt = await tx.wait();

      // Check event emission
      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'MarketCreated';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(await contract.nextMarketId()).to.equal(1);
      console.log("  Market created successfully");
    });

    it("should create market with multiple options (2-10)", async function () {
      const options5 = ["A", "B", "C", "D", "E"];
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      await contract.connect(creator).createMarket(
        "5 options question",
        options5,
        "Tech",
        endTime,
        ethers.parseEther("0.01"),
        ethers.parseEther("5")
      );

      const market = await contract.getMarket(0);
      expect(market.options.length).to.equal(5);
      console.log("  Market with 5 options created");
    });

    it("should reject market with less than 2 options", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      await expect(
        contract.connect(creator).createMarket(
          "Question",
          ["Only one option"],
          "Category",
          endTime,
          ethers.parseEther("0.01"),
          ethers.parseEther("10")
        )
      ).to.be.revertedWith("Invalid option count");
      console.log("  Single option correctly rejected");
    });

    it("should reject market with more than 10 options", async function () {
      const options11 = Array(11).fill("Option");
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      await expect(
        contract.connect(creator).createMarket(
          "Question",
          options11,
          "Category",
          endTime,
          ethers.parseEther("0.01"),
          ethers.parseEther("10")
        )
      ).to.be.revertedWith("Invalid option count");
      console.log("  11 options correctly rejected");
    });

    it("should reject market with end time too soon (< 1 hour)", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 1800; // 30 minutes

      await expect(
        contract.connect(creator).createMarket(
          "Question",
          ["Yes", "No"],
          "Category",
          endTime,
          ethers.parseEther("0.01"),
          ethers.parseEther("10")
        )
      ).to.be.revertedWith("End time too soon");
      console.log("  End time too soon correctly rejected");
    });

    it("should reject market with end time too far (> 365 days)", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 400; // 400 days

      await expect(
        contract.connect(creator).createMarket(
          "Question",
          ["Yes", "No"],
          "Category",
          endTime,
          ethers.parseEther("0.01"),
          ethers.parseEther("10")
        )
      ).to.be.revertedWith("End time too far");
      console.log("  End time too far correctly rejected");
    });

    it("should reject market with invalid bet limits", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      // Min bet = 0
      await expect(
        contract.connect(creator).createMarket(
          "Question",
          ["Yes", "No"],
          "Category",
          endTime,
          0,
          ethers.parseEther("10")
        )
      ).to.be.revertedWith("Min bet must be > 0");

      // Max bet < Min bet
      await expect(
        contract.connect(creator).createMarket(
          "Question",
          ["Yes", "No"],
          "Category",
          endTime,
          ethers.parseEther("10"),
          ethers.parseEther("1")
        )
      ).to.be.revertedWith("Max < min");
      console.log("  Invalid bet limits correctly rejected");
    });
  });

  describe("Market Lifecycle", function () {
    let marketId;
    let endTime;

    beforeEach(async function () {
      const currentTime = await getBlockTimestamp();
      endTime = currentTime + 86400 * 7;
      await contract.connect(creator).createMarket(
        "Test Question",
        ["Yes", "No"],
        "Test",
        endTime,
        ethers.parseEther("0.01"),
        ethers.parseEther("10")
      );
      marketId = 0;
    });

    it("should allow creator to change oracle", async function () {
      await contract.connect(creator).changeOracle(marketId, oracle.address);

      const market = await contract.getMarket(marketId);
      expect(market.oracle).to.equal(oracle.address);
      console.log("  Oracle changed successfully");
    });

    it("should reject non-creator changing oracle", async function () {
      await expect(
        contract.connect(user1).changeOracle(marketId, oracle.address)
      ).to.be.revertedWith("Not creator");
      console.log("  Non-creator oracle change rejected");
    });

    it("should allow oracle to close market after end time", async function () {
      // Advance time past end time
      await ethers.provider.send("evm_increaseTime", [86400 * 8]);
      await ethers.provider.send("evm_mine", []);

      await contract.connect(creator).closeMarket(marketId);

      const market = await contract.getMarket(marketId);
      expect(market.status).to.equal(1); // Closed
      console.log("  Market closed successfully");
    });

    it("should reject closing market before end time", async function () {
      await expect(
        contract.connect(creator).closeMarket(marketId)
      ).to.be.revertedWith("Not ended");
      console.log("  Early close correctly rejected");
    });

    it("should allow oracle to settle closed market", async function () {
      // Close market first
      await ethers.provider.send("evm_increaseTime", [86400 * 8]);
      await ethers.provider.send("evm_mine", []);
      await contract.connect(creator).closeMarket(marketId);

      // Settle with option 0 (Yes)
      await contract.connect(creator).settleMarket(marketId, 0);

      const market = await contract.getMarket(marketId);
      expect(market.status).to.equal(2); // Settled
      expect(market.winningOption).to.equal(0);
      console.log("  Market settled successfully");
    });

    it("should reject settling with invalid option", async function () {
      await ethers.provider.send("evm_increaseTime", [86400 * 8]);
      await ethers.provider.send("evm_mine", []);
      await contract.connect(creator).closeMarket(marketId);

      await expect(
        contract.connect(creator).settleMarket(marketId, 5) // Invalid option
      ).to.be.revertedWith("Invalid option");
      console.log("  Invalid option settlement rejected");
    });

    it("should allow creator to cancel market", async function () {
      await contract.connect(creator).cancelMarket(marketId, "Test cancellation");

      const market = await contract.getMarket(marketId);
      expect(market.status).to.equal(3); // Cancelled
      console.log("  Market cancelled by creator");
    });

    it("should allow owner to cancel market", async function () {
      await contract.connect(owner).cancelMarket(marketId, "Admin cancellation");

      const market = await contract.getMarket(marketId);
      expect(market.status).to.equal(3); // Cancelled
      console.log("  Market cancelled by owner");
    });

    it("should reject cancellation by unauthorized user", async function () {
      await expect(
        contract.connect(user1).cancelMarket(marketId, "Unauthorized")
      ).to.be.revertedWith("Not authorized");
      console.log("  Unauthorized cancellation rejected");
    });

    it("should reject cancellation of settled market", async function () {
      // Close and settle
      await ethers.provider.send("evm_increaseTime", [86400 * 8]);
      await ethers.provider.send("evm_mine", []);
      await contract.connect(creator).closeMarket(marketId);
      await contract.connect(creator).settleMarket(marketId, 0);

      await expect(
        contract.connect(creator).cancelMarket(marketId, "Too late")
      ).to.be.revertedWith("Already settled");
      console.log("  Settled market cancellation rejected");
    });
  });

  describe("Market Queries", function () {
    beforeEach(async function () {
      // Create multiple markets
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      for (let i = 0; i < 5; i++) {
        await contract.connect(creator).createMarket(
          `Question ${i}`,
          ["Yes", "No"],
          "Test",
          endTime,
          ethers.parseEther("0.01"),
          ethers.parseEther("10")
        );
      }
    });

    it("should return correct market details", async function () {
      const market = await contract.getMarket(0);

      expect(market.creator).to.equal(creator.address);
      expect(market.question).to.equal("Question 0");
      expect(market.options.length).to.equal(2);
      expect(market.category).to.equal("Test");
      expect(market.status).to.equal(0); // Active
      console.log("  Market details retrieved correctly");
    });

    it("should return active markets", async function () {
      const activeMarkets = await contract.getActiveMarkets();
      expect(activeMarkets.length).to.equal(5);
      console.log("  Active markets: ", activeMarkets.length);
    });

    it("should return user created markets", async function () {
      const userMarkets = await contract.getUserCreatedMarkets(creator.address);
      expect(userMarkets.length).to.equal(5);
      console.log("  User created markets: ", userMarkets.length);
    });

    it("should return market limits", async function () {
      const limits = await contract.getMarketLimits(0);
      expect(limits.min).to.equal(ethers.parseEther("0.01"));
      expect(limits.max).to.equal(ethers.parseEther("10"));
      console.log("  Market limits retrieved correctly");
    });

    it("should return market status", async function () {
      const status = await contract.getMarketStatus(0);
      expect(status).to.equal(0); // Active
      console.log("  Market status: Active");
    });
  });

  describe("Edge Cases", function () {
    it("should handle 10 options (maximum)", async function () {
      const options10 = Array(10).fill("").map((_, i) => `Option ${i + 1}`);
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      await contract.connect(creator).createMarket(
        "10 options",
        options10,
        "Test",
        endTime,
        ethers.parseEther("0.01"),
        ethers.parseEther("10")
      );

      const market = await contract.getMarket(0);
      expect(market.options.length).to.equal(10);
      console.log("  10 options market created successfully");
    });

    it("should handle minimum valid end time (just over 1 hour)", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 3700; // 1 hour + 100 seconds (margin for block time)

      await contract.connect(creator).createMarket(
        "Minimum time",
        ["Yes", "No"],
        "Test",
        endTime,
        ethers.parseEther("0.01"),
        ethers.parseEther("10")
      );

      expect(await contract.nextMarketId()).to.equal(1);
      console.log("  Minimum end time market created");
    });

    it("should handle maximum valid end time (just under 365 days)", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 364; // 364 days

      await contract.connect(creator).createMarket(
        "Maximum time",
        ["Yes", "No"],
        "Test",
        endTime,
        ethers.parseEther("0.01"),
        ethers.parseEther("10")
      );

      expect(await contract.nextMarketId()).to.equal(1);
      console.log("  Maximum end time market created");
    });

    it("should handle very small bet limits", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      await contract.connect(creator).createMarket(
        "Small bets",
        ["Yes", "No"],
        "Test",
        endTime,
        1, // 1 wei
        2  // 2 wei
      );

      const limits = await contract.getMarketLimits(0);
      expect(limits.min).to.equal(1);
      expect(limits.max).to.equal(2);
      console.log("  Very small bet limits handled");
    });

    it("should handle very large bet limits", async function () {
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      await contract.connect(creator).createMarket(
        "Large bets",
        ["Yes", "No"],
        "Test",
        endTime,
        ethers.parseEther("1000"),
        ethers.parseEther("10000")
      );

      const limits = await contract.getMarketLimits(0);
      expect(limits.min).to.equal(ethers.parseEther("1000"));
      expect(limits.max).to.equal(ethers.parseEther("10000"));
      console.log("  Very large bet limits handled");
    });
  });

  describe("Performance", function () {
    it("should handle rapid market creation", async function () {
      const startTime = Date.now();
      const currentTime = await getBlockTimestamp();
      const endTime = currentTime + 86400 * 7;

      for (let i = 0; i < 10; i++) {
        await contract.connect(creator).createMarket(
          `Rapid Market ${i}`,
          ["Yes", "No"],
          "Performance",
          endTime,
          ethers.parseEther("0.01"),
          ethers.parseEther("10")
        );
      }

      const duration = Date.now() - startTime;
      expect(await contract.nextMarketId()).to.equal(10);
      console.log(`  Created 10 markets in ${duration}ms`);
    });
  });
});
