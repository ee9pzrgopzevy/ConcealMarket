const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

// Helper to get block timestamp
async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

describe("SettlementEngine - Payout Settlement Tests", function () {
  let marketCore;
  let encryptedBetting;
  let settlementEngine;
  let owner, creator, bettor1, bettor2, bettor3;
  let marketId;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, creator, bettor1, bettor2, bettor3] = await ethers.getSigners();

    // Deploy PredictionMarketCore
    const MarketFactory = await ethers.getContractFactory("PredictionMarketCore");
    marketCore = await MarketFactory.deploy();
    await marketCore.waitForDeployment();

    // Deploy EncryptedBetting
    const BettingFactory = await ethers.getContractFactory("EncryptedBetting");
    encryptedBetting = await BettingFactory.deploy(await marketCore.getAddress());
    await encryptedBetting.waitForDeployment();

    // Deploy SettlementEngine
    const SettlementFactory = await ethers.getContractFactory("SettlementEngine");
    settlementEngine = await SettlementFactory.deploy(
      await marketCore.getAddress(),
      await encryptedBetting.getAddress()
    );
    await settlementEngine.waitForDeployment();

    // Create a test market
    const currentTime = await getBlockTimestamp();
    const endTime = currentTime + 86400 * 7;
    await marketCore.connect(creator).createMarket(
      "Test Market",
      ["Yes", "No"],
      "Test",
      endTime,
      ethers.parseEther("0.01"),
      ethers.parseEther("10")
    );
    marketId = 0;

    console.log("  SettlementEngine deployed at:", await settlementEngine.getAddress());
  });

  describe("Deployment", function () {
    it("should deploy with correct contract references", async function () {
      const coreAddress = await settlementEngine.marketCore();
      const bettingAddress = await settlementEngine.bettingContract();

      expect(coreAddress).to.equal(await marketCore.getAddress());
      expect(bettingAddress).to.equal(await encryptedBetting.getAddress());
      console.log("  Contract references verified");
    });

    it("should have correct owner", async function () {
      const contractOwner = await settlementEngine.owner();
      expect(contractOwner).to.equal(owner.address);
      console.log("  Owner verified");
    });

    it("should have default platform fee of 2%", async function () {
      const fee = await settlementEngine.platformFeePercent();
      expect(fee).to.equal(2);
      console.log("  Default platform fee: 2%");
    });
  });

  describe("Platform Fee Management", function () {
    it("should allow setting platform fee", async function () {
      await settlementEngine.setPlatformFee(5);
      const fee = await settlementEngine.platformFeePercent();
      expect(fee).to.equal(5);
      console.log("  Platform fee updated to 5%");
    });

    it("should reject fee above 10%", async function () {
      await expect(
        settlementEngine.setPlatformFee(15)
      ).to.be.revertedWith("Fee too high");

      console.log("  Fee above 10% rejected");
    });

    it("should allow maximum 10% fee", async function () {
      await settlementEngine.setPlatformFee(10);
      const fee = await settlementEngine.platformFeePercent();
      expect(fee).to.equal(10);
      console.log("  Maximum 10% fee accepted");
    });

    it("should allow 0% fee", async function () {
      await settlementEngine.setPlatformFee(0);
      const fee = await settlementEngine.platformFeePercent();
      expect(fee).to.equal(0);
      console.log("  0% fee accepted");
    });
  });

  describe("ETH Handling", function () {
    it("should receive ETH correctly", async function () {
      const amount = ethers.parseEther("1");
      const initialBalance = await ethers.provider.getBalance(
        await settlementEngine.getAddress()
      );

      await owner.sendTransaction({
        to: await settlementEngine.getAddress(),
        value: amount
      });

      const finalBalance = await ethers.provider.getBalance(
        await settlementEngine.getAddress()
      );

      expect(finalBalance - initialBalance).to.equal(amount);
      console.log("  ETH received successfully");
    });

    it("should hold ETH for payout distribution", async function () {
      const amount = ethers.parseEther("5");
      await owner.sendTransaction({
        to: await settlementEngine.getAddress(),
        value: amount
      });

      const balance = await ethers.provider.getBalance(
        await settlementEngine.getAddress()
      );

      expect(balance).to.equal(amount);
      console.log("  ETH held for payouts:", ethers.formatEther(balance));
    });
  });

  describe("Access Control", function () {
    it("should only allow owner to settle market", async function () {
      // Only owner can call settleMarket
      // Non-owner should be rejected
      await expect(
        settlementEngine.connect(bettor1).settleMarket(0, ethers.parseEther("1"))
      ).to.be.revertedWith("Only owner");

      console.log("  Owner-only settleMarket access verified");
    });

    it("should only allow owner to process payout", async function () {
      await expect(
        settlementEngine.connect(bettor1).processPayout(
          0,
          bettor1.address,
          ethers.parseEther("0.5")
        )
      ).to.be.revertedWith("Only owner");

      console.log("  Owner-only processPayout access verified");
    });
  });

  describe("State Variables", function () {
    it("should track pool settlement status", async function () {
      const isSettled = await settlementEngine.poolSettled(0);
      expect(isSettled).to.equal(false);
      console.log("  Initial pool settlement status: false");
    });

    it("should track winning pool values", async function () {
      const winningPool = await settlementEngine.winningPoolPublic(0);
      expect(winningPool).to.equal(0);
      console.log("  Initial winning pool: 0");
    });
  });

  describe("Contract Integration", function () {
    it("should have correct market core address", async function () {
      const coreAddr = await settlementEngine.marketCore();
      expect(coreAddr).to.equal(await marketCore.getAddress());
      console.log("  Market core address verified");
    });

    it("should have correct betting contract address", async function () {
      const bettingAddr = await settlementEngine.bettingContract();
      expect(bettingAddr).to.equal(await encryptedBetting.getAddress());
      console.log("  Betting contract address verified");
    });
  });

  describe("Fee Calculations", function () {
    it("should calculate 2% default fee correctly", async function () {
      const feePercent = await settlementEngine.platformFeePercent();
      const totalPool = ethers.parseEther("100");
      const expectedFee = totalPool * BigInt(feePercent) / BigInt(100);

      expect(expectedFee).to.equal(ethers.parseEther("2"));
      console.log("  2% fee on 100 ETH = 2 ETH");
    });

    it("should calculate 5% fee correctly", async function () {
      await settlementEngine.setPlatformFee(5);
      const feePercent = await settlementEngine.platformFeePercent();
      const totalPool = ethers.parseEther("100");
      const expectedFee = totalPool * BigInt(feePercent) / BigInt(100);

      expect(expectedFee).to.equal(ethers.parseEther("5"));
      console.log("  5% fee on 100 ETH = 5 ETH");
    });

    it("should calculate 10% max fee correctly", async function () {
      await settlementEngine.setPlatformFee(10);
      const feePercent = await settlementEngine.platformFeePercent();
      const totalPool = ethers.parseEther("100");
      const expectedFee = totalPool * BigInt(feePercent) / BigInt(100);

      expect(expectedFee).to.equal(ethers.parseEther("10"));
      console.log("  10% fee on 100 ETH = 10 ETH");
    });
  });

  describe("Edge Cases", function () {
    it("should handle fee updates multiple times", async function () {
      await settlementEngine.setPlatformFee(3);
      expect(await settlementEngine.platformFeePercent()).to.equal(3);

      await settlementEngine.setPlatformFee(7);
      expect(await settlementEngine.platformFeePercent()).to.equal(7);

      await settlementEngine.setPlatformFee(1);
      expect(await settlementEngine.platformFeePercent()).to.equal(1);

      console.log("  Multiple fee updates handled correctly");
    });

    it("should handle multiple ETH deposits", async function () {
      const settlementAddr = await settlementEngine.getAddress();

      await owner.sendTransaction({ to: settlementAddr, value: ethers.parseEther("1") });
      await owner.sendTransaction({ to: settlementAddr, value: ethers.parseEther("2") });
      await owner.sendTransaction({ to: settlementAddr, value: ethers.parseEther("3") });

      const balance = await ethers.provider.getBalance(settlementAddr);
      expect(balance).to.equal(ethers.parseEther("6"));

      console.log("  Multiple ETH deposits accumulated correctly");
    });
  });

  describe("Performance", function () {
    it("should handle rapid fee changes", async function () {
      const startTime = Date.now();

      for (let i = 0; i <= 10; i++) {
        await settlementEngine.setPlatformFee(i);
      }

      const duration = Date.now() - startTime;
      const finalFee = await settlementEngine.platformFeePercent();
      expect(finalFee).to.equal(10);

      console.log(`  11 fee changes in ${duration}ms`);
    });
  });
});
