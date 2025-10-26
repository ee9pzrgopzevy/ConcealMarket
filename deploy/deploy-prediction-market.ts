import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("🚀 Deploying Confidential Prediction Market Contracts...");
  console.log("Deployer:", deployer);

  // 1. Deploy PredictionMarketCore
  console.log("\n1️⃣ Deploying PredictionMarketCore...");
  const marketCore = await deploy("PredictionMarketCore", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ PredictionMarketCore deployed to: ${marketCore.address}`);

  // 2. Deploy EncryptedBetting with MarketCore address
  console.log("\n2️⃣ Deploying EncryptedBetting...");
  const encryptedBetting = await deploy("EncryptedBetting", {
    from: deployer,
    args: [marketCore.address],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ EncryptedBetting deployed to: ${encryptedBetting.address}`);

  // 3. Deploy SettlementEngine with both addresses
  console.log("\n3️⃣ Deploying SettlementEngine...");
  const settlementEngine = await deploy("SettlementEngine", {
    from: deployer,
    args: [marketCore.address, encryptedBetting.address],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ SettlementEngine deployed to: ${settlementEngine.address}`);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Contract Addresses Summary:");
  console.log("================================");
  console.log(`PredictionMarketCore: ${marketCore.address}`);
  console.log(`EncryptedBetting:     ${encryptedBetting.address}`);
  console.log(`SettlementEngine:     ${settlementEngine.address}`);
  console.log("================================");

  console.log("\n⚠️  Next Steps:");
  console.log("1. Update frontend/.env with these addresses");
  console.log("2. Generate ABIs: npm run compile");
  console.log("3. Copy ABIs to frontend/src/contracts/");
};

export default func;
func.tags = ["PredictionMarket"];
