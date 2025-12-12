import React, { createContext, useContext, useMemo } from 'react';
import { createPublicClient, http, parseEther, type PublicClient } from 'viem';
import abi from '../contracts/MeeStake.abi.json';

type RitualContextType = {
  contractAddress: string | null;
  rpcUrl: string;
  chainId: number;
  publicClient: PublicClient;
  /**
   * stake using a connected wallet client (from wagmi useWalletClient or a viem wallet client)
   * walletClient is expected to implement `writeContract` compatible with viem/wagmi wallet clients.
   */
  stake: (amountEth: string | number, walletClient?: any) => Promise<any>;
  /**
   * read staked balance for an address
   */
  getStakedOf: (address: `0x${string}`) => Promise<bigint | number | string>;
};

const RitualContext = createContext<RitualContextType | undefined>(undefined);

export type RitualProviderProps = {
  contractAddress?: string | null;
  rpcUrl?: string;
  chainId?: number;
  children?: React.ReactNode;
};

/**
 * RitualProvider
 *
 * Props:
 * - contractAddress: deployed contract address (if null -> read-only mode)
 * - rpcUrl: RPC endpoint to create public viem client (fallback to VITE_RPC_URL)
 * - chainId: numeric chain id (fallback to VITE_CHAIN_ID or 1337)
 *
 * Exposes:
 * - publicClient (viem) for read operations
 * - stake(amountEth, walletClient) for write operations (requires walletClient)
 * - getStakedOf(address) to read stake mapping
 *
 * Usage:
 * - Wrap app (or RitualPage) with <RitualProvider contractAddress={...} rpcUrl={...}>...
 * - In components, call const ritual = useRitual(); then ritual.stake('0.1', walletClient);
 */
export const RitualProvider: React.FC<RitualProviderProps> = ({
  contractAddress = null,
  rpcUrl = (import.meta.env.VITE_RPC_URL as string) || 'http://localhost:8545',
  chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 1337),
  children,
}) => {
  // create a stable publicClient for reads
  const publicClient = useMemo(
    () =>
      createPublicClient({
        transport: http(rpcUrl),
        chain: {
          id: chainId,
          name: 'dev',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: [rpcUrl] } },
        } as any,
      }),
    [rpcUrl, chainId]
  );

  // stake helper: expects a wallet client (from wagmi createWalletClient / useWalletClient)
  const stake = async (amountEth: string | number, walletClient?: any) => {
    if (!contractAddress) {
      throw new Error('Contract address is not configured in RitualProvider');
    }
    if (!walletClient) {
      throw new Error('walletClient is required to send transactions. Use wagmi useWalletClient() or pass a viem wallet client.');
    }
    const value = parseEther(String(amountEth));
    // call contract function `stake(uint256 amount)` as in ABI
    // Some wallet clients (viem/wagmi) return a transaction hash or a result object.
    const res = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: 'stake',
      args: [value],
    });
    return res;
  };

  // read helper (reads mapping public function `stakes(address)`)
  const getStakedOf = async (address: `0x${string}`) => {
    if (!contractAddress) {
      throw new Error('Contract address is not configured in RitualProvider');
    }
    const res = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: 'stakes',
      args: [address],
    });
    return res;
  };

  const value: RitualContextType = {
    contractAddress,
    rpcUrl,
    chainId,
    publicClient,
    stake,
    getStakedOf,
  };

  return <RitualContext.Provider value={value}>{children}</RitualContext.Provider>;
};

export function useRitual(): RitualContextType {
  const ctx = useContext(RitualContext);
  if (!ctx) {
    throw new Error('useRitual must be used within a RitualProvider');
  }
  return ctx;
}
