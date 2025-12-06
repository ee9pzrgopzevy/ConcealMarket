const { ethers } = require("hardhat");

const MARKET_ADDRESS = "0x8698b5d567c3DCD04dDea554C2C1B284c612989a";

const MARKET_ABI = [
    {
        inputs: [
            { name: "question", type: "string" },
            { name: "options", type: "string[]" },
            { name: "category", type: "string" },
            { name: "endTime", type: "uint64" },
            { name: "minBetAmount", type: "uint256" },
            { name: "maxBetAmount", type: "uint256" },
        ],
        name: "createMarket",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "nextMarketId",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
];

// Sample markets data
const sampleMarkets = [
    {
        question: "Will Bitcoin reach $150,000 by Q2 2025?",
        options: ["Yes", "No"],
        category: "Crypto",
        daysFromNow: 180,
        minBet: "0.01",
        maxBet: "5",
    },
    {
        question: "Will Ethereum flip Bitcoin in market cap by 2026?",
        options: ["Yes", "No"],
        category: "Crypto",
        daysFromNow: 365,
        minBet: "0.01",
        maxBet: "10",
    },
    {
        question: "Which AI company will have the highest market cap by end of 2025?",
        options: ["NVIDIA", "Microsoft", "Google", "OpenAI (if public)", "Other"],
        category: "Tech",
        daysFromNow: 365,
        minBet: "0.05",
        maxBet: "5",
    },
    {
        question: "Will Apple release AR glasses in 2025?",
        options: ["Yes", "No"],
        category: "Tech",
        daysFromNow: 365,
        minBet: "0.01",
        maxBet: "3",
    },
    {
        question: "Who will win the 2025 Champions League?",
        options: ["Real Madrid", "Manchester City", "Bayern Munich", "PSG", "Other"],
        category: "Sports",
        daysFromNow: 200,
        minBet: "0.01",
        maxBet: "2",
    },
    {
        question: "Will the Fed cut interest rates before July 2025?",
        options: ["Yes", "No"],
        category: "Finance",
        daysFromNow: 210,
        minBet: "0.02",
        maxBet: "5",
    },
    {
        question: "What will be the dominant Layer 2 by TVL in Q4 2025?",
        options: ["Arbitrum", "Optimism", "Base", "zkSync", "Starknet", "Other"],
        category: "Crypto",
        daysFromNow: 300,
        minBet: "0.01",
        maxBet: "3",
    },
    {
        question: "Will SpaceX successfully land humans on Mars by 2030?",
        options: ["Yes", "No"],
        category: "Tech",
        daysFromNow: 365,
        minBet: "0.01",
        maxBet: "10",
    },
];

async function main() {
    console.log("🎲 Creating Sample Prediction Markets...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Creator address:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    const marketContract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, deployer);

    // Get current market count
    const startId = await marketContract.nextMarketId();
    console.log("Starting market ID:", startId.toString());
    console.log("Market creation is FREE (only gas required)\n");

    // Create markets
    for (let i = 0; i < sampleMarkets.length; i++) {
        const market = sampleMarkets[i];
        const endTime = Math.floor(Date.now() / 1000) + (market.daysFromNow * 24 * 60 * 60);

        console.log(`📌 Creating market ${i + 1}/${sampleMarkets.length}:`);
        console.log(`   Question: ${market.question}`);
        console.log(`   Category: ${market.category}`);
        console.log(`   Options: ${market.options.join(", ")}`);

        try {
            const tx = await marketContract.createMarket(
                market.question,
                market.options,
                market.category,
                endTime,
                ethers.parseEther(market.minBet),
                ethers.parseEther(market.maxBet)
            );

            const receipt = await tx.wait();
            console.log(`   ✅ Created! TX: ${receipt.hash}\n`);

            // Small delay to avoid nonce issues
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}\n`);
        }
    }

    // Get final market count
    const endId = await marketContract.nextMarketId();
    console.log("\n🎉 Done!");
    console.log(`Created ${endId - startId} new markets`);
    console.log(`Total markets: ${endId.toString()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
