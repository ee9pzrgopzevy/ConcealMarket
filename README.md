# 🔐 ConcealMarket

### Privacy-First Prediction Market on Blockchain

A revolutionary prediction market platform built with **Zama's Fully Homomorphic Encryption (FHE)** technology, ensuring complete privacy for bets and predictions while maintaining blockchain transparency and decentralization.

[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627EEA?logo=ethereum)](https://ethereum.org)
[![Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHE-764BA2)](https://zama.ai)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://concealmarket.vercel.app)

## 🌟 Overview

ConcealMarket is a decentralized prediction market platform where users can create markets, place encrypted bets, and participate in predictions across various categories (Crypto, Tech, Politics, Sports, Finance, etc.) with complete privacy powered by Fully Homomorphic Encryption.

**Live Demo**: [https://concealmarket.vercel.app](https://concealmarket.vercel.app)

## ✅ Completed Features

### Core Functionality
- ✅ **Market Creation**: Users can create prediction markets with custom questions, options, and bet limits
- ✅ **Category System**: Auto-categorization with filters (Crypto, Tech, Politics, Sports, Finance, Geopolitics, Culture, New)
- ✅ **FHE-Encrypted Betting**: Bet amounts and choices encrypted client-side using Zama FHE SDK
- ✅ **Market Lifecycle Management**: Active → Closed → Settled → Cancelled states
- ✅ **Multi-Wallet Support**: MetaMask, OKX Wallet, Coinbase Wallet integration via RainbowKit

### Smart Contracts (Deployed on Sepolia)
- ✅ **PredictionMarketCore** (`0x8Dce79619d45493a7D8b8D9B8300cE5E92495003`): Market creation and lifecycle
- ✅ **EncryptedBetting** (`0x4875B940F966dBEfDe7b46f309C83C77be2Ca99F`): FHE-encrypted bet placement
- ✅ **SettlementEngine** (`0x4Ee4BD42d98C820a045b3308696c187917F78a01`): Payout calculation and distribution

### Frontend Features
- ✅ **Home Page**: Browse active markets with category filtering
- ✅ **Market Detail Page**: View market info, place encrypted bets, see statistics
- ✅ **Create Market Page**: Form with question, category selector, options (2-10), bet limits, end date
- ✅ **About Page**: Project introduction with demo video, features, tech stack
- ✅ **Profile Page**: User dashboard with wallet balance, betting history, profit chart, statistics
- ✅ **Responsive Design**: Mobile-friendly UI with Tailwind CSS and shadcn/ui

### Developer Features
- ✅ **Modern Stack**: React 18 + TypeScript + Vite
- ✅ **FHE Integration**: Client-side encryption with dynamic Zama SDK loading
- ✅ **Type Safety**: Full TypeScript coverage with proper types
- ✅ **Clean Architecture**: Hooks-based state management, modular components

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity 0.8.27** with FHE support
- **Zama fhEVM v0.8.0** - Fully Homomorphic Encryption library
- **Hardhat** - Development framework
- **OpenZeppelin** - Security libraries
- **Sepolia Testnet** - Current deployment network

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wagmi v2** - Ethereum React hooks
- **RainbowKit** - Wallet connection UI
- **Zama FHE Relayer SDK v0.2.0** - Client-side encryption
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vercel** - Deployment platform

### FHE Implementation
- **Client-Side Encryption**: `euint8` for bet options, `euint64` for bet amounts
- **Dynamic SDK Loading**: CDN-based FHE SDK for multi-wallet compatibility
- **ACL Permissions**: Proper allowThis/allow for encrypted data access
- **Sepolia Config**: Built-in KMS/ACL addresses for Sepolia testnet

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 20+
Yarn or npm
MetaMask wallet
Sepolia testnet ETH
```

### Installation

```bash
# Clone repository
git clone https://github.com/ee9pzrgopzevy/ConcealMarket.git
cd ConcealMarket

# Install root dependencies
npm install

# Compile contracts
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npm run compile

# Deploy contracts (requires private key in .env)
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/deploy.js --network sepolia

# Install frontend dependencies
cd frontend
yarn install

# Start development server
yarn dev
```

### Environment Configuration

Create `.env` in project root:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

Frontend environment variables are hardcoded in hooks for Sepolia deployment.

## 📋 Project Structure

```
ConcealMarket/
├── contracts/
│   ├── PredictionMarketCore.sol    # Market lifecycle management
│   ├── EncryptedBetting.sol        # FHE-encrypted bet storage
│   └── SettlementEngine.sol        # Payout calculation
├── scripts/
│   ├── deploy.js                   # Contract deployment script
│   └── create-markets.js           # Create sample markets
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # FHE encryption utilities
│   │   ├── pages/                  # Page components
│   │   └── config/                 # Wagmi configuration
│   └── public/
│       └── demo.mp4                # Demo video
└── hardhat.config.ts               # Hardhat configuration
```

## 🗺️ Roadmap

### Phase 1: MVP (✅ Completed)
- ✅ Smart contract development with FHE encryption
- ✅ Market creation and betting functionality
- ✅ Basic frontend with wallet connection
- ✅ Sepolia testnet deployment
- ✅ Category system and filtering
- ✅ User profile page with statistics

### Phase 2: Core Enhancements (🚧 In Progress)
- 🔄 Real betting history with FHE decryption
- 🔄 Oracle integration for automated settlement
- 🔄 Market search functionality
- 🔄 Real-time market statistics
- 🔄 Notification system for market events
- 🔄 Mobile app (React Native)

### Phase 3: Advanced Features (📋 Planned)
- 📋 Liquidity pools for popular markets
- 📋 Social features (market comments, sharing)
- 📋 Advanced analytics dashboard
- 📋 Market templates and quick creation
- 📋 API for third-party integrations
- 📋 Governance token for platform decisions

### Phase 4: Production Launch (🎯 Future)
- 🎯 Mainnet deployment
- 🎯 Security audit by reputable firm
- 🎯 Layer 2 integration (Arbitrum/Optimism)
- 🎯 Cross-chain support
- 🎯 Professional market makers
- 🎯 Institutional partnerships

### Phase 5: Ecosystem Growth (🌐 Vision)
- 🌐 Developer SDK for custom markets
- 🌐 Market creator incentive program
- 🌐 Integration with prediction aggregators
- 🌐 AI-powered market recommendations
- 🌐 Global expansion and localization
- 🌐 Decentralized governance DAO

## 🎯 Use Cases

### Current Markets
- **Cryptocurrency**: Bitcoin/Ethereum price predictions
- **Technology**: AI company valuations, tech adoption
- **Layer 2**: Dominant L2 solution predictions
- **FHE Adoption**: Mainstream FHE adoption timeline

### Potential Applications
- **Sports**: Game outcomes, tournament winners
- **Politics**: Election results, policy predictions
- **Finance**: Stock movements, economic indicators
- **Entertainment**: Award ceremonies, show outcomes
- **Science**: Research breakthroughs, space missions

## 🔐 Privacy & Security

### FHE Encryption
- **Client-Side Encryption**: All sensitive data encrypted before blockchain submission
- **Computation on Encrypted Data**: Smart contracts compute without decryption
- **Selective Decryption**: Only winning bets decrypted during settlement
- **Mathematical Guarantee**: Privacy ensured by cryptographic proofs

### Smart Contract Security
- **Reentrancy Protection**: ReentrancyGuard on all payable functions
- **Access Control**: Owner-only functions for oracle and settlement
- **State Management**: Proper market lifecycle validation
- **Tested**: Comprehensive test coverage (deployment verified on Sepolia)

## 📖 How It Works

### 1. Market Creation (Plaintext)
- User creates market with question, options, category, and bet limits
- Market creator pays 0.01 ETH creation fee
- Market stored on-chain with plaintext metadata

### 2. Betting (FHE-Encrypted)
```typescript
// Client-side encryption flow
const fhe = await initializeFHE(provider);
const input = fhe.createEncryptedInput(contractAddress, userAddress);
input.add8(selectedOption);    // Encrypt option as euint8
input.add64(betAmount);         // Encrypt amount as euint64
const { handles, inputProof } = await input.encrypt();

// Submit to contract
await placeBet(marketId, handles[0], handles[1], inputProof);
```

### 3. Settlement (Owner-Only)
- Market oracle determines winning outcome
- Smart contract marks market as settled
- Winners can claim proportional share of prize pool

### 4. Payout Calculation
```
User Payout = (User Bet Amount / Total Winning Pool) × Total Pool × (1 - Platform Fee)
Platform Fee: 2%
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** - For pioneering FHE technology and fhEVM SDK
- **Ethereum Foundation** - For Sepolia testnet infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **RainbowKit** - For excellent wallet connection UX
- **shadcn/ui** - For beautiful component library

## 🔗 Links

- **Live Demo**: [https://concealmarket.vercel.app](https://concealmarket.vercel.app)
- **GitHub**: [https://github.com/ee9pzrgopzevy/ConcealMarket](https://github.com/ee9pzrgopzevy/ConcealMarket)
- **Zama Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Sepolia Explorer**: [https://sepolia.etherscan.io](https://sepolia.etherscan.io)

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/ee9pzrgopzevy/ConcealMarket/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ee9pzrgopzevy/ConcealMarket/discussions)

---

**Built with privacy in mind. Powered by Fully Homomorphic Encryption.**

*Making prediction markets truly private and fair for everyone.* 🔐✨
