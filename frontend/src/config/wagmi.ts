import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ConcealMarket',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia],
  ssr: false,
});
