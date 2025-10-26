# 🔐 ConcealMarket

### Privacy-First Prediction Market on Blockchain

A revolutionary prediction market platform built with **Zama's Fully Homomorphic Encryption (FHE)** technology, ensuring complete privacy for bets and predictions while maintaining blockchain transparency and decentralization.

[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Ethereum](https://img.shields.io/badge/Ethereum-Compatible-627EEA?logo=ethereum)](https://ethereum.org)
[![Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHE-764BA2)](https://zama.ai)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C)](https://hardhat.org)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://reactjs.org)

## 🌟 Key Features

### 🔒 **Complete Privacy Protection**
- **End-to-End Encryption**: All bet amounts and predictions are encrypted using FHE
- **Zero Knowledge**: No one can see your bets or choices until settlement
- **Front-Running Protection**: Encrypted bets prevent market manipulation
- **Quantum-Resistant**: Built on quantum-safe cryptographic foundations

### 🚀 **Blockchain Benefits Without Compromise**
- **Decentralized Oracle**: Community-driven outcome resolution
- **Smart Contract Escrow**: Automated and trustless settlement
- **Full Transparency**: Public audit trails while protecting user privacy
- **Ethereum Compatible**: Works on Sepolia, Mainnet, and L2 solutions

### 💻 **Developer-Friendly**
- **Solidity Native**: Write confidential smart contracts using familiar Solidity syntax
- **Modern Stack**: React 18, TypeScript, Hardhat, Vite for optimal developer experience
- **Multi-Wallet Support**: MetaMask, OKX Wallet, Coinbase Wallet, and more

## 🎯 How It Works

### Privacy-Preserving Betting Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User selects prediction and bet amount             │
│     ↓ FHE Encryption (Client-Side)                     │
│  2. Encrypted data sent to smart contract              │
│     ↓ Blockchain stores encrypted bets                 │
│  3. Market closes, oracle sets winning outcome         │
│     ↓ Gateway decrypts winning bets only               │
│  4. Winners claim rewards automatically                │
└─────────────────────────────────────────────────────────┘
```

### Contract Architecture

- **PredictionMarketCore**: Market lifecycle management (creation, closing, cancellation)
- **EncryptedBetting**: FHE-encrypted bet placement and storage
- **SettlementEngine**: Winner determination and reward distribution via Gateway

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Sepolia ETH for testing

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy:prediction-market

# Start frontend
cd frontend
npm install
npm run dev
```

### Environment Configuration

Create `frontend/.env`:

```env
VITE_MARKET_ADDRESS=<PredictionMarketCore_address>
VITE_BETTING_ADDRESS=<EncryptedBetting_address>
VITE_SETTLEMENT_ADDRESS=<SettlementEngine_address>
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## 📋 Use Cases

### Prediction Markets
- **Sports Outcomes**: Bet on game results with complete privacy
- **Political Events**: Predict election outcomes confidentially
- **Financial Markets**: Forecast price movements without revealing positions
- **Entertainment**: Predict award winners, show outcomes, etc.

### Privacy Benefits
- **No Front-Running**: Encrypted bets prevent others from copying successful predictions
- **Market Integrity**: True market sentiment without influence from visible large bets
- **User Privacy**: Protect betting patterns and strategies from competitors
- **Regulatory Compliance**: Meet privacy requirements in regulated jurisdictions

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity 0.8.28** with Zama FHE libraries
- **Hardhat** for development and testing
- **OpenZeppelin** for secure contract patterns

### Frontend
- **React 18** with TypeScript
- **RainbowKit** for wallet connection
- **Wagmi** for Ethereum interactions
- **Zama FHE SDK** for client-side encryption
- **shadcn/ui** for modern UI components
- **Tailwind CSS** for styling

### Network
- **Ethereum Sepolia** testnet (current deployment)
- **Mainnet ready** (production deployment planned)

## 📖 Documentation

For detailed documentation, see:
- [Deployment Guide](DEPLOYMENT.md)
- [Architecture Overview](docs/architecture.md)
- [FHE Integration Guide](docs/fhe-guide.md)

## 🔐 Security

### FHE Encryption
- Client-side encryption using Zama FHE SDK
- Server-side computation on encrypted data
- Gateway-based decryption for settlement

### Smart Contract Security
- Reentrancy protection
- Access control for oracle operations
- Market lifecycle state management
- Comprehensive test coverage

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** - For pioneering FHE technology and fhEVM
- **Ethereum Foundation** - For Sepolia testnet infrastructure
- **OpenZeppelin** - For secure smart contract libraries

## 🔗 Links

- [Live Demo](#) (Coming Soon)
- [Documentation](#)
- [Zama FHE Docs](https://docs.zama.ai/fhevm)
- [Hardhat Docs](https://hardhat.org/docs)

---

**Built with privacy in mind. Powered by Fully Homomorphic Encryption.**
