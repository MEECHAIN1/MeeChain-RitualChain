import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import type { Chain } from 'wagmi/chains';

const RPC = (import.meta.env.VITE_RPC_URL as string | undefined) || 'http://localhost:8545';
const WC_PROJECT_ID = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) || 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96';

// Define a local dev chain for wagmi
const devChain: Chain = {
  id: 1337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC] },
  },
} as const;

export const wagmiClient = createConfig({
  chains: [devChain],
  connectors: [
    injected(),
    walletConnect({
      projectId: WC_PROJECT_ID,
    }),
  ],
  transports: {
    [devChain.id]: http(RPC),
  },
});
