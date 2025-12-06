# ConcealMarket

## Privacy-Preserving Prediction Market Protocol

A decentralized prediction market platform leveraging **Fully Homomorphic Encryption (FHE)** to enable private betting while maintaining verifiable fairness. Built on Zama's fhEVM, ConcealMarket ensures that bet amounts and choices remain encrypted throughout the entire lifecycle, from placement to settlement.

[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-764BA2)](https://docs.zama.ai/fhevm)
[![Ethereum](https://img.shields.io/badge/Network-Sepolia-627EEA?logo=ethereum)](https://sepolia.etherscan.io)
[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://concealmarket.vercel.app)

**Live Application**: [https://concealmarket.vercel.app](https://concealmarket.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Why Privacy Matters](#why-privacy-matters)
- [How It Works](#how-it-works)
- [Technical Architecture](#technical-architecture)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Oracle and Settlement System](#oracle-and-settlement-system)
- [FHE Implementation Details](#fhe-implementation-details)
- [Contract Addresses](#contract-addresses)
- [Dependencies](#dependencies)
- [Unit Tests](#unit-tests)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

ConcealMarket is a prediction market protocol that solves a fundamental problem in decentralized betting: **privacy**. Traditional on-chain prediction markets expose all bets publicly, allowing sophisticated actors to:

- Front-run large bets
- Manipulate odds by observing betting patterns
- Identify and target successful bettors
- Extract MEV from betting transactions

By encrypting bet amounts and choices using Fully Homomorphic Encryption, ConcealMarket creates a fair playing field where:

- **Bets are encrypted**: No one can see what option you chose or how much you bet
- **Pools are computed privately**: The contract accumulates encrypted pools without revealing individual contributions
- **Settlement is verifiable**: Winners can prove their claims without exposing other participants' bets

---

## Why Privacy Matters

### The Problem with Transparent Prediction Markets

In traditional prediction markets (Polymarket, Augur, etc.), all betting data is publicly visible:

```
User A bets 10 ETH on Option 1  ->  Publicly visible
User B bets 5 ETH on Option 2   ->  Publicly visible
Current odds: 66% / 34%         ->  Publicly visible
```

This transparency enables:

1. **Front-running**: Searchers detect large bets in mempool and front-run them
2. **Odds manipulation**: Whales can observe market sentiment and strategically manipulate
3. **Privacy violations**: Betting patterns can reveal sensitive information about users
4. **MEV extraction**: Validators and searchers extract value from betting transactions

### The ConcealMarket Solution

```
User A bets [encrypted] on [encrypted]  ->  Only User A knows
User B bets [encrypted] on [encrypted]  ->  Only User B knows
Pool totals: [encrypted]                ->  Hidden until settlement
```

With FHE:
- Bets are encrypted client-side before submission
- Smart contracts compute on encrypted data without decryption
- Only settlement reveals necessary information (winning pool total)
- Individual bet details remain private forever

---

## How It Works

### 1. Market Creation

Anyone can create a prediction market by specifying:

| Parameter | Description | Constraints |
|-----------|-------------|-------------|
| Question | The prediction question | Required |
| Options | Possible outcomes | 2-10 options |
| Category | Market category | Crypto, Tech, Sports, etc. |
| End Time | When betting closes | 1 hour - 365 days |
| Min Bet | Minimum bet amount | > 0 |
| Max Bet | Maximum bet amount | >= Min Bet |

**Market creation is free** - only gas fees are required.

### 2. Encrypted Betting Flow

```
+------------------------------------------------------------------+
|                     CLIENT-SIDE (Browser)                         |
+------------------------------------------------------------------+
|  1. User selects option (e.g., "Yes" = 0)                        |
|  2. User enters bet amount (e.g., 0.5 ETH)                       |
|  3. FHE SDK encrypts:                                            |
|     - option -> euint8 (encrypted 8-bit integer)                 |
|     - amount -> euint64 (encrypted 64-bit integer)               |
|  4. SDK generates proof of valid encryption                      |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                     ON-CHAIN (Smart Contract)                     |
+------------------------------------------------------------------+
|  5. Contract receives: (encryptedOption, encryptedAmount, proof) |
|  6. FHE.fromExternal() validates and converts encrypted inputs   |
|  7. Contract stores encrypted bet data                           |
|  8. Pool accumulation via encrypted arithmetic:                  |
|     pool[i] = FHE.add(pool[i], FHE.select(option==i, amount, 0)) |
|  9. ETH transferred to contract                                  |
+------------------------------------------------------------------+
```

### 3. Market Lifecycle

```
+----------+    End Time    +----------+    Oracle    +----------+
|  ACTIVE  | -------------> |  CLOSED  | -----------> | SETTLED  |
+----------+    Reached     +----------+   Decision   +----------+
     |                                                      |
     |  Creator/Admin                                       |
     |  Cancellation                                        |
     v                                                      v
+----------+                                          +----------+
|CANCELLED |                                          |  PAYOUT  |
+----------+                                          +----------+
     |                                                      |
     v                                                      v
   REFUND                                              WINNERS
  (Full ETH)                                          CLAIM ETH
```

### 4. Settlement and Payout

When the oracle settles a market:

1. **Oracle determines outcome**: Based on real-world events
2. **Winning option declared**: Contract marks `winningOption`
3. **Pool decryption**: Settlement engine decrypts winning pool total
4. **Payout calculation**:

```
userPayout = (userBet / winningPoolTotal) * totalPool * (1 - platformFee)

Where:
- userBet: User's encrypted bet amount (decrypted for winner)
- winningPoolTotal: Sum of all bets on winning option
- totalPool: Sum of all bets across all options
- platformFee: 2% (configurable, max 10%)
```

**Example**:
```
Total Pool: 10 ETH
Winning Pool (Option A): 3 ETH
User's Bet on Option A: 1 ETH
Platform Fee: 2%

User Payout = (1 / 3) * 10 * 0.98 = 3.27 ETH
User Profit = 3.27 - 1 = 2.27 ETH
```

---

## Technical Architecture

### System Overview

```
+---------------------------------------------------------------------+
|                           FRONTEND                                   |
|  +-------------+  +-------------+  +-------------+  +-------------+ |
|  |   React 18  |  |  Wagmi v2   |  | RainbowKit  |  |  Zama SDK   | |
|  | + TypeScript|  |  + viem     |  |   Wallets   |  |  FHE Client | |
|  +-------------+  +-------------+  +-------------+  +-------------+ |
+-----------------------------------+---------------------------------+
                                    | JSON-RPC / WebSocket
                                    v
+---------------------------------------------------------------------+
|                    ZAMA ETHEREUM (Sepolia)                          |
|  +---------------------------------------------------------------+  |
|  |                    Smart Contracts                             |  |
|  |  +-------------------+  +-------------------+                  |  |
|  |  | PredictionMarket  |  |  EncryptedBetting |                  |  |
|  |  |      Core         |<-|    (FHE Bets)     |                  |  |
|  |  +-------------------+  +-------------------+                  |  |
|  |           |                      |                             |  |
|  |           v                      v                             |  |
|  |  +---------------------------------------------+               |  |
|  |  |          SettlementEngine                   |               |  |
|  |  |    (Payout Calculation & Distribution)      |               |  |
|  |  +---------------------------------------------+               |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |                    fhEVM Infrastructure                        |  |
|  |  +-------------+  +-------------+  +-------------+             |  |
|  |  |     KMS     |  |     ACL     |  |   Gateway   |             |  |
|  |  | (Key Mgmt)  |  |  (Access)   |  | (Decrypt)   |             |  |
|  |  +-------------+  +-------------+  +-------------+             |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Smart Contracts** | Solidity | 0.8.24 | Core logic |
| | fhEVM | 0.9.1 | FHE operations |
| | OpenZeppelin | 5.x | Security utilities |
| | Hardhat | 2.26.0 | Development framework |
| **Frontend** | React | 18.x | UI framework |
| | TypeScript | 5.8.x | Type safety |
| | Vite | 5.x | Build tool |
| | Wagmi | 2.x | Ethereum hooks |
| | RainbowKit | 2.x | Wallet connection |
| **FHE Client** | Relayer SDK | 0.3.0-5 | Client encryption |
| **Deployment** | Vercel | - | Frontend hosting |
| | Sepolia | - | Testnet |

---

## Smart Contract Architecture

### Contract Inheritance and Dependencies

```
+------------------------------------------------------------------+
|                    PredictionMarketCore.sol                       |
|  +------------------------------------------------------------+  |
|  |  Ownable (OpenZeppelin)                                    |  |
|  |  - Owner can cancel markets                                |  |
|  |  - Owner can set platform parameters                       |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  State:                                                           |
|  - markets: mapping(uint256 => Market)                           |
|  - marketBettors: mapping(uint256 => address[])                  |
|  - userCreatedMarkets: mapping(address => uint256[])             |
|                                                                   |
|  Functions:                                                       |
|  - createMarket() -> uint256                                     |
|  - changeOracle(marketId, newOracle)                             |
|  - closeMarket(marketId)                                         |
|  - settleMarket(marketId, winningOption)                         |
|  - cancelMarket(marketId, reason)                                |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                    EncryptedBetting.sol                           |
|  +------------------------------------------------------------+  |
|  |  ZamaEthereumConfig                                        |  |
|  |  - Provides KMS, ACL, Gateway addresses for Sepolia        |  |
|  |  ReentrancyGuard (OpenZeppelin)                            |  |
|  |  - Prevents reentrancy attacks on payable functions        |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  State:                                                           |
|  - bets: mapping(marketId => mapping(user => Bet))               |
|  - optionPools: mapping(marketId => mapping(optionId => Pool))   |
|                                                                   |
|  Bet Struct:                                                      |
|  - option: euint8 (encrypted)                                    |
|  - amount: euint64 (encrypted)                                   |
|  - claimed: bool                                                 |
|  - timestamp: uint64                                             |
|                                                                   |
|  Functions:                                                       |
|  - placeBet(marketId, encOption, encAmount, proof) payable       |
|  - refundBet(marketId)                                           |
|  - getUserBet(marketId, user) -> (euint8, euint64, bool, uint64) |
|  - getOptionPool(marketId, optionId) -> euint64                  |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                    SettlementEngine.sol                           |
|  +------------------------------------------------------------+  |
|  |  ZamaEthereumConfig                                        |  |
|  |  - Inherits FHE configuration                              |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  State:                                                           |
|  - winningPoolPublic: mapping(marketId => uint256)               |
|  - poolSettled: mapping(marketId => bool)                        |
|  - platformFeePercent: uint256 (default 2%, max 10%)             |
|                                                                   |
|  Functions:                                                       |
|  - settleMarket(marketId, decryptedWinningPool)                  |
|  - processPayout(marketId, user, userAmount)                     |
|  - setPlatformFee(newFeePercent)                                 |
+------------------------------------------------------------------+
```

### FHE Operations Used

| Operation | Solidity Function | Description |
|-----------|-------------------|-------------|
| **Input Conversion** | `FHE.fromExternal(encValue, proof)` | Convert client-encrypted values to on-chain encrypted types |
| **Addition** | `FHE.add(a, b)` | Add encrypted values for pool accumulation |
| **Equality** | `FHE.eq(a, b)` | Compare encrypted option with loop index |
| **Selection** | `FHE.select(condition, ifTrue, ifFalse)` | Conditional assignment based on encrypted boolean |
| **Type Conversion** | `FHE.asEuint8(plaintext)` | Convert plaintext to encrypted type |
| **ACL** | `FHE.allowThis(value)` | Grant contract access to encrypted value |
| **ACL** | `FHE.allow(value, address)` | Grant address access to encrypted value |

---

## Oracle and Settlement System

### Oracle Architecture

The oracle system in ConcealMarket follows a **trusted oracle model** where the market creator (or designated oracle) is responsible for determining outcomes.

```
+----------------------------------------------------------------+
|                      ORACLE FLOW                                |
+----------------------------------------------------------------+
|                                                                 |
|  1. MARKET CREATION                                             |
|     +-------------+                                             |
|     |   Creator   |---- createMarket() ----> oracle = creator   |
|     +-------------+                                             |
|                                                                 |
|  2. ORACLE CHANGE (Optional)                                    |
|     +-------------+                                             |
|     |   Creator   |---- changeOracle() ---> oracle = newAddr    |
|     +-------------+                                             |
|                                                                 |
|  3. MARKET CLOSURE (After End Time)                             |
|     +-------------+                                             |
|     |   Oracle    |---- closeMarket() ----> status = Closed     |
|     +-------------+                                             |
|                                                                 |
|  4. OUTCOME DETERMINATION                                       |
|     +-------------+      Real-World      +-------------+        |
|     |   Oracle    |<---- Event Data -----|  External   |        |
|     +-------------+                      |   Source    |        |
|           |                              +-------------+        |
|           v                                                     |
|     settleMarket(marketId, winningOption)                       |
|           |                                                     |
|           v                                                     |
|     status = Settled, winningOption = X                         |
|                                                                 |
+----------------------------------------------------------------+
```

### Settlement Process

```solidity
// Step 1: Oracle closes market after end time
function closeMarket(uint256 marketId) external {
    require(msg.sender == market.oracle, "Not oracle");
    require(block.timestamp >= market.endTime, "Not ended");
    market.status = MarketStatus.Closed;
}

// Step 2: Oracle determines winning option
function settleMarket(uint256 marketId, uint8 winningOption) external {
    require(msg.sender == market.oracle, "Not oracle");
    require(market.status == MarketStatus.Closed, "Not closed");
    require(winningOption < market.options.length, "Invalid option");

    market.status = MarketStatus.Settled;
    market.winningOption = winningOption;
}

// Step 3: Settlement engine processes payouts
function settleMarket(uint256 marketId, uint256 decryptedWinningPool) external {
    // Called by owner after off-chain decryption via Gateway
    winningPoolPublic[marketId] = decryptedWinningPool;
    poolSettled[marketId] = true;
}

// Step 4: Winners claim payouts
function processPayout(uint256 marketId, address user, uint256 userAmount) external {
    uint256 userShare = (userAmount * totalPool * (100 - platformFeePercent))
                      / (winningPoolPublic[marketId] * 100);
    payable(user).transfer(userShare);
}
```

### Future: Decentralized Oracle Integration

For production deployment, ConcealMarket can integrate with:

| Oracle Solution | Use Case | Integration Method |
|-----------------|----------|-------------------|
| **Chainlink** | Price feeds, sports results | Direct integration via `AggregatorV3Interface` |
| **UMA** | Optimistic oracle with dispute resolution | Request/assert/dispute pattern |
| **API3** | First-party oracles | dAPI integration |
| **Custom DAO** | Community-driven resolution | Multi-sig or governance voting |

---

## FHE Implementation Details

### Client-Side Encryption

```typescript
// frontend/src/lib/fhe.ts

export async function encryptBet(
    selectedOption: number,
    amountWei: bigint,
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    walletProvider: any
): Promise<{ optionHandle: string; amountHandle: string; proof: string }> {

    // Initialize FHE instance with provider
    const fhe = await getFheInstance(contractAddress, userAddress, walletProvider);

    // Create encrypted input builder
    const input = fhe.createEncryptedInput(contractAddress, userAddress);

    // Encrypt option as euint8 (0-255 range)
    input.add8(selectedOption);

    // Encrypt amount as euint64 (supports up to ~18.4 ETH in wei)
    input.add64(amountWei);

    // Generate encrypted handles and proof
    const encrypted = await input.encrypt();

    return {
        optionHandle: encrypted.handles[0],  // bytes32
        amountHandle: encrypted.handles[1],  // bytes32
        proof: encrypted.inputProof          // bytes
    };
}
```

### On-Chain Pool Accumulation

```solidity
// contracts/EncryptedBetting.sol

function _updateOptionPools(uint256 marketId, euint8 option, euint64 amount) internal {
    // Iterate through all possible options (0-9)
    for (uint8 i = 0; i < 10; i++) {
        // Check if bet is for this option (encrypted comparison)
        ebool isThisOption = FHE.eq(option, FHE.asEuint8(i));

        // If match: add amount, else: add 0
        euint64 addAmount = FHE.select(isThisOption, amount, FHE.asEuint64(0));

        // Accumulate into pool
        OptionPool storage pool = optionPools[marketId][i];
        if (!pool.initialized) {
            pool.totalAmount = addAmount;
            pool.initialized = true;
        } else {
            pool.totalAmount = FHE.add(pool.totalAmount, addAmount);
        }

        // Grant contract access to updated pool
        FHE.allowThis(pool.totalAmount);
    }
}
```

### Data Types

| Type | Encrypted Type | Range | Use Case |
|------|---------------|-------|----------|
| Option | `euint8` | 0-255 | Bet option selection (0-9 used) |
| Amount | `euint64` | 0 - 2^64-1 | Bet amount in wei (~18.4 ETH max) |
| Comparison | `ebool` | true/false | Encrypted conditionals |

---

## Contract Addresses

### Sepolia Testnet Deployment

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **PredictionMarketCore** | `0x8698b5d567c3DCD04dDea554C2C1B284c612989a` | [View](https://sepolia.etherscan.io/address/0x8698b5d567c3DCD04dDea554C2C1B284c612989a) |
| **EncryptedBetting** | `0x7A59912d1C10B9Db146c86ab0eF493290f57A99D` | [View](https://sepolia.etherscan.io/address/0x7A59912d1C10B9Db146c86ab0eF493290f57A99D) |
| **SettlementEngine** | `0x595A1b298D9150b95c0De7A130B52e81dDC15216` | [View](https://sepolia.etherscan.io/address/0x595A1b298D9150b95c0De7A130B52e81dDC15216) |

### Network Configuration

| Parameter | Value |
|-----------|-------|
| Network | Ethereum Sepolia Testnet |
| Chain ID | 11155111 |
| RPC URL | `https://ethereum-sepolia-rpc.publicnode.com` |
| Explorer | `https://sepolia.etherscan.io` |
| Faucet | [Sepolia Faucet](https://sepoliafaucet.com) |

---

## Dependencies

### Smart Contract Dependencies

```json
{
  "dependencies": {
    "@fhevm/solidity": "^0.9.1",
    "@zama-fhe/relayer-sdk": "0.3.0-5"
  },
  "devDependencies": {
    "@fhevm/hardhat-plugin": "0.3.0-1",
    "@nomicfoundation/hardhat-chai-matchers": "^2.1.0",
    "@nomicfoundation/hardhat-ethers": "^3.1.0",
    "@openzeppelin/contracts": "^5.0.0",
    "hardhat": "^2.26.0",
    "ethers": "^6.15.0",
    "chai": "^4.5.0",
    "mocha": "^11.7.1",
    "typescript": "^5.8.3"
  }
}
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "wagmi": "^2.x",
    "@rainbow-me/rainbowkit": "^2.x",
    "viem": "^2.x",
    "@tanstack/react-query": "^5.x",
    "tailwindcss": "^3.4.x",
    "shadcn-ui": "latest",
    "recharts": "^2.x",
    "sonner": "^1.x"
  }
}
```

### FHE SDK (CDN)

```html
<script src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"></script>
```

---

## Unit Tests

### Test Coverage

| Test Suite | Tests | Description |
|------------|-------|-------------|
| `PredictionMarketCore.test.js` | 30 | Market creation, lifecycle, queries |
| `EncryptedBetting.test.js` | 17 | FHE betting, validation, retrieval |
| `SettlementEngine.test.js` | 20 | Fee management, ETH handling, access control |
| **Total** | **67** | All passing |

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:market      # PredictionMarketCore tests
npm run test:betting     # EncryptedBetting tests
npm run test:settlement  # SettlementEngine tests

# Run with verbose output
npm run test:mock
```

### Test Categories

**PredictionMarketCore Tests:**
- Deployment and initialization
- Market creation with various options (2-10)
- End time validation (1 hour - 365 days)
- Bet limit validation
- Market lifecycle (close, settle, cancel)
- Oracle management
- Query functions

**EncryptedBetting Tests:**
- FHE encrypted bet placement
- `FHE.fromExternal()` input conversion
- `FHE.add()` pool accumulation
- `FHE.eq()` / `FHE.select()` conditional logic
- Double betting prevention
- Invalid proof rejection
- User bet retrieval

**SettlementEngine Tests:**
- Contract deployment
- Platform fee management (0-10%)
- ETH receive and holding
- Access control (owner-only functions)
- State variable tracking
- Fee calculation accuracy

### Sample Test Output

```
  PredictionMarketCore - Market Management Tests
    Deployment
      [x] should deploy contract successfully
      [x] should have correct initial state
    Market Creation
      [x] should create a market successfully (free, only gas)
      [x] should create market with multiple options (2-10)
      [x] should reject market with less than 2 options
      ...
    Market Lifecycle
      [x] should allow oracle to close market after end time
      [x] should allow oracle to settle closed market
      ...

  EncryptedBetting - FHE Betting Operations
    FHE Encrypted Betting
      [x] should place encrypted bet with euint8 option and euint64 amount
      [x] should accumulate encrypted bets in option pools
      [x] FHE.fromExternal() correctly rejects invalid proofs
      ...

  SettlementEngine - Payout Settlement Tests
    Platform Fee Management
      [x] should allow setting platform fee
      [x] should reject fee above 10%
      ...

  67 passing (1s)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 7+
- MetaMask or compatible wallet
- Sepolia testnet ETH ([Faucet](https://sepoliafaucet.com))

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/ConcealMarket.git
cd ConcealMarket

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your private key

# Compile contracts
npm run compile

# Run tests
npm run test:all

# Deploy to Sepolia
npm run deploy:prediction-market
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
# .env (root)
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

---

## Project Structure

```
ConcealMarket/
├── contracts/
│   ├── PredictionMarketCore.sol    # Market management (plaintext)
│   ├── EncryptedBetting.sol        # FHE bet storage
│   └── SettlementEngine.sol        # Payout distribution
├── test/
│   ├── PredictionMarketCore.test.js
│   ├── EncryptedBetting.test.js
│   └── SettlementEngine.test.js
├── scripts/
│   ├── deploy-prediction-market.js
│   └── create-sample-markets.js
├── frontend/
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── hooks/                  # React hooks
│   │   │   ├── usePredictionMarket.ts
│   │   │   └── useEncryptedBetting.ts
│   │   ├── lib/
│   │   │   ├── fhe.ts              # FHE encryption
│   │   │   └── toast-utils.tsx     # Transaction notifications
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── MarketDetail.tsx
│   │   │   ├── CreateMarket.tsx
│   │   │   └── Profile.tsx
│   │   └── config/
│   │       └── wagmi.ts
│   └── index.html
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## Roadmap

### Phase 1: MVP (Completed)
- [x] Smart contract architecture with FHE
- [x] Encrypted betting functionality
- [x] Market lifecycle management
- [x] Frontend with wallet integration
- [x] Sepolia testnet deployment
- [x] Comprehensive unit tests

### Phase 2: Enhanced Features (In Progress)
- [ ] Gateway integration for automatic decryption
- [ ] Chainlink oracle integration
- [ ] Real-time market statistics
- [ ] Mobile-responsive improvements
- [ ] Transaction history with FHE decryption

### Phase 3: Production Ready
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] L2 integration (Arbitrum/Optimism)
- [ ] Performance optimization
- [ ] Documentation expansion

### Phase 4: Ecosystem Growth
- [ ] Developer SDK
- [ ] API for integrations
- [ ] Governance token
- [ ] DAO for market resolution disputes
- [ ] Cross-chain support

---

## License

This project is licensed under the BSD-3-Clause-Clear License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **[Zama](https://zama.ai)** - fhEVM and FHE technology
- **[OpenZeppelin](https://openzeppelin.com)** - Secure smart contract libraries
- **[Ethereum Foundation](https://ethereum.org)** - Sepolia testnet infrastructure
- **[RainbowKit](https://rainbowkit.com)** - Wallet connection UX
- **[shadcn/ui](https://ui.shadcn.com)** - UI component library

---

**Built with Fully Homomorphic Encryption. Privacy by design.**
