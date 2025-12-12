import React, { useEffect, useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { useRitual } from '../contexts/RitualContext';
import { formatEther } from 'viem';

type StakingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: string;
};

/**
 * StakingModal
 *
 * - Uses useRitual() for contract + publicClient reads
 * - Uses useWalletClient() (wagmi) for sending transactions
 * - Shows current staked balance (reads from contract) and allows staking an amount in ETH
 */
export const StakingModal: React.FC<StakingModalProps> = ({ isOpen, onClose, defaultAmount = '0.01' }) => {
  const ritual = useRitual();
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState<string>(defaultAmount);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stakedBalance, setStakedBalance] = useState<string | null>(null);

  // Load staked balance for connected address (or clear if no address)
  const loadStaked = async (addr?: `0x${string}`) => {
    setError(null);
    setStakedBalance(null);
    if (!addr) return;
    try {
      const res = await ritual.getStakedOf(addr);
      // res may be bigint or numeric string; turn into ETH string
      const ethStr = typeof res === 'bigint' || typeof res === 'number' || typeof res === 'string'
        ? formatEther(BigInt(res as any))
        : String(res);
      setStakedBalance(ethStr);
    } catch (err: any) {
      // ignore if contract not configured
      setError(err?.message ?? String(err));
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // when modal opens, refresh staked balance for current account (or none)
    if (address) {
      loadStaked(address as `0x${string}`);
    } else {
      setStakedBalance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, address, ritual.contractAddress]);

  if (!isOpen) return null;

  const handleStake = async () => {
    setError(null);
    setTxHash(null);

    if (!ritual.contractAddress) {
      setError('Contract address not configured. Deploy contract or provide address.');
      return;
    }

    if (!walletClient) {
      setError('No connected wallet client. Please connect a wallet first.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Enter a positive amount to stake');
      return;
    }

    setPending(true);
    try {
      const result = await ritual.stake(amount, walletClient);
      // result can be a txHash string or an object — try to normalize
      let hash: string | null = null;
      if (!result) {
        hash = null;
      } else if (typeof result === 'string') {
        hash = result;
      } else if (typeof result === 'object' && ('hash' in result)) {
        // Ethers/viem transaction object
        // @ts-ignore
        hash = result.hash ?? result.transactionHash ?? null;
      } else {
        hash = String(result);
      }

      setTxHash(hash);
      // refresh staked balance if we have an address
      if (address) {
        // small delay to let chain process (optional)
        setTimeout(() => loadStaked(address as `0x${string}`), 1200);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={modalWrapStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>Stake Mee</h3>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Amount (ETH)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
            inputMode="decimal"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Contract:</strong> {ritual.contractAddress ?? 'Not configured'}
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Connected:</strong> {isConnected ? address : 'No wallet connected'}
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Staked balance:</strong>{' '}
          {stakedBalance ?? (address ? 'loading...' : 'connect wallet to view')}
        </div>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleStake} disabled={pending} style={buttonStyle}>
            {pending ? 'Staking...' : 'Stake'}
          </button>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Close
          </button>
        </div>

        {txHash && (
          <div style={{ marginTop: 12 }}>
            <div>Transaction:</div>
            <code style={{ wordBreak: 'break-all' }}>{txHash}</code>
          </div>
        )}
      </div>
    </div>
  );
};

// minimal inline styles to keep the component self-contained
const modalWrapStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.35)',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: 420,
  maxWidth: '94%',
  background: '#fff',
  padding: 20,
  borderRadius: 8,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  cursor: 'pointer',
};

export default StakingModal;
