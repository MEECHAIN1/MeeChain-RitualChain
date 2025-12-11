
import React, { useState } from 'react';
import { useWalletClient } from 'wagmi';
import abi from '../contracts/MeeStake.abi.json';
import { parseEther } from 'viem';

export const StakingModal: React.FC<{ contract: `0x${string}` }> = ({ contract }) => {
  const [txHash, setTxHash] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  const doStake = async () => {
    if (!walletClient) {
      alert('No wallet client. Please connect wallet first.');
      return;
    }

    try {
      // Example: calling stake(uint256 amount). Adjust args to match your contract expectations.
      const result = await (walletClient as any).writeContract({
        address: contract,
        abi,
        functionName: 'stake',
        args: [parseEther('0.001')], // stake 0.001 ETH (example)
      });
      setTxHash(String(result)); // result may be txHash or transaction object depending on client
    } catch (err) {
      console.error('Stake failed', err);
      alert('Stake failed: ' + String(err));
    }
  };

  return (
    <div style={{ padding: 12, border: '1px solid #eee', background: '#fff' }}>
      <h4>Staking</h4>
      <button onClick={doStake}>Stake 0.001 ETH</button>
      {txHash && (
        <div style={{ marginTop: 8 }}>
          Tx: <code>{txHash}</code>
        </div>
      )}
    </div>
  );
};
