import { createConfig, configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import type { Chain } from 'wagmi';

const RPC = import.meta.env.ETH_RPC_URL || 'http://127.0.0.1:8545';
const WC_PROJECT_ID = import.meta.env.WALLETCONNECT_PROJECT_ID || 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96';

// Define a local dev chain for wagmi
const devChain: Chain = {
  id: 13390,
  name: 'meechain ',
  network: 'dev',
  nativeCurrency: { name: 'MeeChain', symbol: 'MCB', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC] },
    public: { http: [RPC] },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [devChain],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: RPC };
      },
    }),
  ]
);

export const wagmiClient = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId:"c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
      },
    }),
  ],
  publicClient,
});

export { chains, publicClient };
