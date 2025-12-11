import React, { useEffect, useState } from 'react';
import { GenesisRitual } from './components/GenesisRitual';
import { WalletModal } from './components/WalletModal';
import { StakingModal } from './components/StakingModal';
import { WagmiConfig } from 'wagmi';
import { wagmiClient } from './wagmi/client';
import { CONTRACT_ADDRESS } from './config';

export default function App() {
  const [openWallet, setOpenWallet] = useState(true);
  const [devAddr, setDevAddr] = useState<string | null>(null);

  useEffect(() => {
    // If deploy wrote src/config.ts we can import CONTRACT_ADDRESS above.
    // For dev-wallet simulation, check window.__DEV_WALLET__ (set by WalletModal dev connect)
    const w = (window as any).__DEV_WALLET__;
    if (w) setDevAddr(w);
  }, []);

  return (
    <WagmiConfig config={wagmiClient}>
      <div style={{ padding: 16 }}>
        <GenesisRitual lang="th" />
        <WalletModal isOpen={openWallet} onClose={() => setOpenWallet(false)} lang="th" />
        { (devAddr || CONTRACT_ADDRESS) && (
          <div style={{ marginTop: 12 }}>
            <p>Contract: {CONTRACT_ADDRESS || '---'}</p>
            <StakingModal contract={CONTRACT_ADDRESS as `0x${string}`} />
          </div>
        )}
        {!CONTRACT_ADDRESS && <p>กรุณา deploy สัญญา MeeStake เพื่อลอง stake (ใช้ pnpm run deploy:local)</p>}
      </div>
    </WagmiConfig>
  );
}
