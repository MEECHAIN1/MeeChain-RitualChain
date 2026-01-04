import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  getStakedOf: (address: `0x${string}`) => Promise<bigint>;
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
 * Behavior:
 * - If contractAddress prop provided -> use it.
 * - Otherwise try to fetch /artifacts/deploy.json at runtime and read { address }.
 * - If that fails, fallback to import.meta.env.VITE_CONTRACT_ADDRESS (if present).
 *
 * Exposes:
 * - publicClient (viem) for read operations
 * - stake(amountEth, walletClient) for write operations (requires walletClient)
 * - getStakedOf(address) to read stake mapping
 */
export const RitualProvider: React.FC<RitualProviderProps> = ({
  contractAddress: initialContractAddress = null,
  rpcUrl = (import.meta.env.VITE_RPC_URL as string | undefined) || 'http://localhost:8545',
  chainId = Number((import.meta.env.VITE_CHAIN_ID as string | undefined) ?? 1337),
  children,
}) => {
  // local state for contractAddress so we can update it if we discover artifacts/deploy.json
  const [contractAddress, setContractAddress] = useState<string | null>(() => {
    // prefer explicit prop if provided
    if (initialContractAddress) return initialContractAddress;
    // otherwise try env (this will work if .env.local has VITE_CONTRACT_ADDRESS when Vite reads env)
    const envAddr = (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) || '';
    return envAddr || null;
  });

  // Attempt to auto-load artifacts/deploy.json at runtime if no contractAddress yet.
  useEffect(() => {
    if (contractAddress) return;

    let mounted = true;
    async function tryLoadArtifact() {
      try {
        const res = await fetch('/artifacts/deploy.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('no artifact');
        const json = await res.json();
        if (mounted && json?.address) {
          setContractAddress(String(json.address));
          return;
        }
      } catch (err) {
        // ignore — fallback to env already handled in initial state
      }
    }

    tryLoadArtifact();
    return () => {
      mounted = false;
    };
  }, [contractAddress]);

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
    const res = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: 'stake',
      args: [value],
    });
    return res;
  };

  // read helper (reads mapping public function `stakes(address)`)
  const getStakedOf = async (address: `0x${string}`): Promise<bigint> => {
    if (!contractAddress) {
      throw new Error('Contract address is not configured in RitualProvider');
    }
    const res = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName: 'stakes',
      args: [address],
    });
    // viem returns bigint for uint256 reads
    return res as bigint;
  };

  const value: RitualContextType = {
    contractAddress,
    rpcUrl,
    chainId,
    publicClient: publicClient as any,
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
