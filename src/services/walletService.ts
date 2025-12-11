import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

export function getClient(rpcUrl: string) {
  return createConfig({
    chains: [{ ...mainnet, id: 1337 }],
    transports: { 1337: http(rpcUrl) },
  });
}
