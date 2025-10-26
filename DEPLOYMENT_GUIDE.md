# ConcealMarket Deployment Guide

## Prerequisites

1. **Node.js** (>= 20.0.0)
2. **Wallet with Sepolia ETH** (for gas fees)
3. **API Keys**:
   - Infura API Key (https://infura.io)
   - Etherscan API Key (https://etherscan.io/apis)

## Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Configure Environment Variables

### Backend Configuration (.env)

Create `.env` file in project root:

```env
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/${INFURA_API_KEY}
```

**⚠️ Important**:
- Remove `0x` prefix from private key
- Never commit `.env` to GitHub
- Keep your private key secure

### Get Sepolia ETH

Get testnet ETH from faucets:
- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia

## Step 3: Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript types
- Create ABI files in `artifacts/`

## Step 4: Deploy to Sepolia

```bash
npm run deploy:prediction-market
```

This will deploy three contracts:
1. **PredictionMarketCore** - Market lifecycle management
2. **EncryptedBetting** - FHE-encrypted bet placement
3. **SettlementEngine** - Winner determination and payouts

**Deployment Output Example:**
```
✅ PredictionMarketCore deployed to: 0x1234...
✅ EncryptedBetting deployed to: 0x5678...
✅ SettlementEngine deployed to: 0x9abc...
```

Addresses are automatically saved to `deployments/prediction-market-sepolia-{timestamp}.json`

## Step 5: Update Frontend Configuration

Update `frontend/.env` with deployed addresses:

```env
VITE_MARKET_ADDRESS=0x1234... # PredictionMarketCore address
VITE_BETTING_ADDRESS=0x5678... # EncryptedBetting address
VITE_SETTLEMENT_ADDRESS=0x9abc... # SettlementEngine address
VITE_CHAIN_ID=11155111
VITE_CHAIN_NAME=Sepolia
```

## Step 6: Verify Contracts on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

**Example:**
```bash
# Verify PredictionMarketCore (no constructor args)
npx hardhat verify --network sepolia 0x1234...

# Verify EncryptedBetting (needs marketCore address)
npx hardhat verify --network sepolia 0x5678... 0x1234...

# Verify SettlementEngine (needs both addresses)
npx hardhat verify --network sepolia 0x9abc... 0x1234... 0x5678...
```

## Step 7: Run Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Troubleshooting

### Error: Insufficient funds
- Get more Sepolia ETH from faucets
- Check wallet balance: `cast balance <YOUR_ADDRESS> --rpc-url $SEPOLIA_RPC_URL`

### Error: Nonce too high
- Reset MetaMask account: Settings → Advanced → Clear activity tab data

### Error: Contract deployment failed
- Check RPC endpoint is working
- Verify private key format (no 0x prefix in .env)
- Ensure sufficient gas limits

### Error: Frontend can't connect to contracts
- Verify contract addresses in `frontend/.env`
- Check if wallet is connected to Sepolia network
- Clear browser cache and reload

## Post-Deployment Checklist

- [ ] Contracts deployed successfully
- [ ] Deployment addresses saved
- [ ] Frontend `.env` updated
- [ ] Contracts verified on Etherscan
- [ ] Frontend connects to deployed contracts
- [ ] Test creating a market
- [ ] Test placing encrypted bets
- [ ] Test settlement flow

## Network Information

**Sepolia Testnet:**
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/{INFURA_KEY}
- Explorer: https://sepolia.etherscan.io
- Zama FHE: Supported with KMS/ACL/Gateway

## Security Notes

1. **Never commit private keys** - Use `.env` and `.gitignore`
2. **Test thoroughly** - Use testnet before mainnet
3. **Audit contracts** - Consider professional audit for production
4. **Monitor gas prices** - Sepolia gas is free but limited
5. **Keep dependencies updated** - Regular security updates

## Useful Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy:prediction-market

# Verify contract
npm run verify:sepolia

# Clean build artifacts
npm run clean

# Run linter
npm run lint

# Format code
npm run prettier:write
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/ee9pzrgopzevy/ConcealMarket/issues
- Zama Documentation: https://docs.zama.ai/fhevm
- Hardhat Documentation: https://hardhat.org/docs
