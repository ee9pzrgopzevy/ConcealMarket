const { ethers } = require("hardhat");

async function main() {
  console.log("🎯 Creating Prediction Markets on Sepolia...\n");

  const MARKET_ADDRESS = "0x6E435CaC8B2abF29dfBaBD4f0EC4c60cf1eC3821";

  const [deployer] = await ethers.getSigners();
  console.log("Creator address:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const marketContract = await ethers.getContractAt("PredictionMarketCore", MARKET_ADDRESS);

  // Get current creation fee
  const creationFee = await marketContract.marketCreationFee();
  console.log("Market creation fee:", ethers.formatEther(creationFee), "ETH\n");

  // Calculate end time: 90 days from now
  const currentTime = Math.floor(Date.now() / 1000);
  const endTime = currentTime + (90 * 24 * 60 * 60); // 90 days
  const endDate = new Date(endTime * 1000);
  console.log("Markets will end on:", endDate.toISOString(), "\n");

  const markets = [
    {
      question: "Will Bitcoin reach $150,000 by end of 2025?",
      options: ["Yes", "No"],
      minBet: "0.001",
      maxBet: "10",
    },
    {
      question: "Will Ethereum upgrade to ETH 3.0 successfully in 2025?",
      options: ["Yes", "No"],
      minBet: "0.001",
      maxBet: "5",
    },
    {
      question: "Which AI company will have the highest valuation in 90 days?",
      options: ["OpenAI", "Anthropic", "Google DeepMind", "Meta AI"],
      minBet: "0.001",
      maxBet: "10",
    },
    {
      question: "Will FHE (Fully Homomorphic Encryption) become mainstream in Web3?",
      options: ["Yes - within 6 months", "Yes - within 1 year", "No - will take longer"],
      minBet: "0.001",
      maxBet: "5",
    },
    {
      question: "What will be the dominant L2 solution by market cap in 90 days?",
      options: ["Arbitrum", "Optimism", "Base", "zkSync", "Other"],
      minBet: "0.001",
      maxBet: "10",
    },
  ];

  console.log(`Creating ${markets.length} prediction markets...\n`);

  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    console.log(`📊 Market ${i + 1}/${markets.length}: ${market.question}`);
    console.log(`   Options: ${market.options.join(", ")}`);
    console.log(`   Min Bet: ${market.minBet} ETH, Max Bet: ${market.maxBet} ETH`);

    try {
      const tx = await marketContract.createMarket(
        market.question,
        market.options,
        BigInt(endTime),
        ethers.parseEther(market.minBet),
        ethers.parseEther(market.maxBet),
        { value: creationFee }
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();

      // Extract market ID from events
      const createEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id("MarketCreated(uint256,address,string,uint64)")
      );

      if (createEvent) {
        const marketId = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256"],
          createEvent.topics[1]
        )[0];
        console.log(`   ✅ Created! Market ID: ${marketId}`);
      } else {
        console.log(`   ✅ Created!`);
      }

      console.log("");
    } catch (error) {
      console.error(`   ❌ Failed:`, error.message);
      console.log("");
    }
  }

  console.log("🎉 Finished creating markets!");
  console.log("\n📋 Summary:");
  console.log(`   Contract: ${MARKET_ADDRESS}`);
  console.log(`   Creator: ${deployer.address}`);
  console.log(`   Markets created: ${markets.length}`);
  console.log(`   End time: ${endDate.toISOString()}`);
  console.log(`   View on Etherscan: https://sepolia.etherscan.io/address/${MARKET_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
