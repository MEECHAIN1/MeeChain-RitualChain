import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { WagmiProvider } from 'wagmi';
import { RitualProvider } from './contracts/RitualContext';
import MeeBot from './components/MeeBot';
import { StakingModal } from './components/StakingModal';
import { WalletModal } from './components/WalletModal';
import { GenesisRitual } from './components/GenesisRitual';
import { wagmiClient } from './wagmi/client';

type Language = 'en' | 'th';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [stakingOpen, setStakingOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleWalletConnect = (_walletName: string, address?: string) => {
    if (address) {
      setWalletAddress(address);
      setWalletOpen(false);
    }
  };

  return (
    <WagmiProvider config={wagmiClient}>
      <RitualProvider>
        <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
          <header style={{ marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
            <h1>MeeChain - RitualChain</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setLang('en')} style={{ background: lang === 'en' ? '#2563eb' : '#f0f0f0', color: lang === 'en' ? '#fff' : '#000', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>English</button>
              <button onClick={() => setLang('th')} style={{ background: lang === 'th' ? '#2563eb' : '#f0f0f0', color: lang === 'th' ? '#fff' : '#000', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>ไทย</button>
              <button onClick={() => setWalletOpen(true)} style={{ marginLeft: 'auto', padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
              </button>
            </div>
          </header>

          <main style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
            <section>
              <h2>Genesis Ritual</h2>
              <GenesisRitual lang={lang} />

              <h2 style={{ marginTop: 40 }}>Staking</h2>
              <button onClick={() => setStakingOpen(true)} style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
                Open Staking Modal
              </button>
            </section>

            <aside>
              <MeeBot />
            </aside>
          </main>

          <StakingModal isOpen={stakingOpen} onClose={() => setStakingOpen(false)} />
          <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} onConnect={handleWalletConnect} lang={lang} />

          <Analytics />
        </div>
      </RitualProvider>
    </WagmiProvider>
  );
};

export default App;
