const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Confidential Prediction Market Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy PredictionMarketCore
  console.log("1️⃣ Deploying PredictionMarketCore...");
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const marketCore = await PredictionMarketCore.deploy();
  await marketCore.waitForDeployment();
  const marketCoreAddress = await marketCore.getAddress();
  console.log(`✅ PredictionMarketCore deployed to: ${marketCoreAddress}\n`);

  // 2. Deploy EncryptedBetting
  console.log("2️⃣ Deploying EncryptedBetting...");
  const EncryptedBetting = await ethers.getContractFactory("EncryptedBetting");
  const encryptedBetting = await EncryptedBetting.deploy(marketCoreAddress);
  await encryptedBetting.waitForDeployment();
  const bettingAddress = await encryptedBetting.getAddress();
  console.log(`✅ EncryptedBetting deployed to: ${bettingAddress}\n`);

  // 3. Deploy SettlementEngine
  console.log("3️⃣ Deploying SettlementEngine...");
  const SettlementEngine = await ethers.getContractFactory("SettlementEngine");
  const settlementEngine = await SettlementEngine.deploy(marketCoreAddress, bettingAddress);
  await settlementEngine.waitForDeployment();
  const settlementAddress = await settlementEngine.getAddress();
  console.log(`✅ SettlementEngine deployed to: ${settlementAddress}\n`);

  // Summary
  console.log("🎉 All contracts deployed successfully!\n");
  console.log("📋 Contract Addresses Summary:");
  console.log("================================");
  console.log(`PredictionMarketCore: ${marketCoreAddress}`);
  console.log(`EncryptedBetting:     ${bettingAddress}`);
  console.log(`SettlementEngine:     ${settlementAddress}`);
  console.log("================================\n");

  console.log("⚠️  Next Steps:");
  console.log("1. Update frontend/.env with these addresses:");
  console.log(`   VITE_MARKET_ADDRESS=${marketCoreAddress}`);
  console.log(`   VITE_BETTING_ADDRESS=${bettingAddress}`);
  console.log(`   VITE_SETTLEMENT_ADDRESS=${settlementAddress}`);
  console.log("\n2. Copy contract ABIs to frontend:");
  console.log("   - Check artifacts/contracts/ folder");
  console.log("   - Copy ABI JSON to frontend/src/contracts/\n");

  // Save addresses to a JSON file for easy access
  const fs = require("fs");
  const addresses = {
    PredictionMarketCore: marketCoreAddress,
    EncryptedBetting: bettingAddress,
    SettlementEngine: settlementAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const fileName = `${deploymentsDir}/prediction-market-${addresses.network}-${Date.now()}.json`;
  fs.writeFileSync(fileName, JSON.stringify(addresses, null, 2));
  console.log(`📝 Deployment info saved to: ${fileName}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
