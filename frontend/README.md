# ConcealMarket - Confidential Prediction Market

Privacy-preserving prediction market built with Zama's FHE technology.

## Features

- **Create Markets**: Anyone can create prediction markets with custom questions and options
- **Encrypted Betting**: Bet amounts and choices are fully encrypted using FHE
- **Privacy Protection**: No one can see what you bet or how much until market settles
- **Fair Settlement**: Oracle-based result verification

## Tech Stack

- React 18 + TypeScript
- Vite
- Wagmi v2 + RainbowKit
- Zama FHE SDK
- Shadcn/ui + Tailwind CSS

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env.local`:

```env
VITE_MARKET_ADDRESS=0x...
VITE_BETTING_ADDRESS=0x...
VITE_SETTLEMENT_ADDRESS=0x...
```

## Project Structure

```
src/
├── components/     # UI components
├── pages/          # Page components
├── hooks/          # React hooks for contracts
├── lib/            # FHE utilities
└── config/         # Wagmi configuration
```

## License

MIT
