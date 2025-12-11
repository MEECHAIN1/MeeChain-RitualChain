
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export function getClients(rpcUrl: string) {
  const publicClient = createPublicClient({ transport: http(rpcUrl), chain: { id: 1337, name: 'dev', nativeCurrency: { name:'ETH', symbol:'ETH', decimals:18 }, rpcUrls: { default: { http: [rpcUrl] } } } });
  return { publicClient };
}

export async function stakeExample(publicClient: any, contractAddress: `0x${string}`, abi: any) {
  const account = privateKeyToAccount('0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291');
  const walletClient = createWalletClient({ account, chain: { id:1337, name:'dev', nativeCurrency:{ name:'ETH', symbol:'ETH', decimals:18 }, rpcUrls:{ default:{ http:['http://localhost:8545'] } } }, transport: http('http://localhost:8545') });
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: 'stake',
    args: [parseEther('1')],
  });
  return hash;
}
