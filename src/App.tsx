import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from './hooks/useLocation';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { GenesisPage } from './components/pages/GenesisPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';
import { HallOfOriginsPage } from './components/pages/HallOfOriginsPage';
import { ProposalAnalysisPage } from './components/pages/ProposalAnalysisPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { PersonaProvider } from './contexts/PersonaContext';
import { PersonaManagementPage } from './components/pages/PersonaManagementPage';
import { MeeBotProvider, useMeeBots } from './contexts/MeeBotContext';
import { BadgeNotification } from './components/BadgeNotification';
import { MigrationPage } from './components/pages/MigrationPage';
import { MissionsPage } from './components/pages/MissionsPage';
import { GiftingPage } from './components/pages/GiftingPage';
import { ChatPage } from './components/pages/ChatPage';
import { GovernancePage } from './components/pages/GovernancePage';
import { MiningPage } from './components/pages/MiningPage';
import { TransparencyPage } from './components/pages/TransparencyPage';
import { DeFiPage } from './components/pages/DeFiPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
// 🎯 RITUAL CHAIN IMPORTS
import { RitualProvider } from './contexts/RitualContext';
import { RitualPage } from './components/pages/RitualPage';

// Wagmi / React Query
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config as wagmiConfig } from './wagmi/config';

// Wallet modal
import { WalletModal } from './components/WalletModal';

// 1. ตั้งค่า Query Client
const queryClient = new QueryClient();

const AppLayout: React.FC<{
  onOpenWallet: () => void;
  contractAddress: string | null;
  connectedAddress: string | null;
}> = ({ onOpenWallet, contractAddress, connectedAddress }) => {
  const [currentPath, navigate] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { currentBadgeNotification, dismissBadgeNotification } = useMeeBots();
  const { t } = useLanguage();

  const getHeaderTitle = (path: string): string => {
    switch (path) {
      case '/':
      case '/dashboard':
        return t('title.dashboard');
      case '/ritual':
        return t('title.ritual');
      case '/genesis':
        return t('title.genesis');
      case '/chat':
        return t('title.chat');
      case '/governance':
        return t('title.governance');
      case '/gifting':
        return t('title.gifting');
      case '/migration':
        return t('title.migration');
      case '/defi':
        return t('title.defi');
      case '/missions':
        return t('title.missions');
      case '/analysis':
        return t('title.analysis');
      case '/origins':
        return t('title.origins');
      case '/settings':
        return t('title.settings');
      case '/personas':
        return t('title.personas');
      case '/mining':
        return t('title.mining');
      case '/transparency':
        return t('title.transparency');
      default:
        return t('title.default');
    }
  };

  const setRoute = useCallback(
    (path: string) => {
      navigate(path);
      setSidebarOpen(false);
    },
    [navigate]
  );

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard':
        return <DashboardPage navigate={setRoute} />;
      case '/ritual':
        // RitualPage can read contractAddress from RitualContext (provided by RitualProvider)
        return <RitualPage />;
      case '/genesis':
        return <GenesisPage />;
      case '/chat':
        return <ChatPage />;
      case '/governance':
        return <GovernancePage />;
      case '/gifting':
        return <GiftingPage />;
      case '/migration':
        return <MigrationPage />;
      case '/defi':
        return <DeFiPage />;
      case '/missions':
        return <MissionsPage />;
      case '/analysis':
        return <ProposalAnalysisPage />;
      case '/origins':
        return <HallOfOriginsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/personas':
        return <PersonaManagementPage />;
      case '/mining':
        return <MiningPage />;
      case '/transparency':
        return <TransparencyPage />;
      default:
        return <PlaceholderPage title="404 - Not Found" />;
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-meebot-bg">
        <Sidebar currentPath={currentPath} navigate={setRoute} isOpen={isSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            title={getHeaderTitle(currentPath)}
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
            // optional: a connect button in Header can call onOpenWallet()
            onConnectClick={onOpenWallet}
            connectedAddress={connectedAddress}
            contractAddress={contractAddress}
          />
          <main className="flex-1 overflow-y-auto">{renderCurrentPage()}</main>
        </div>
      </div>
      {currentBadgeNotification && (
        <BadgeNotification badge={currentBadgeNotification} onClose={dismissBadgeNotification} />
      )}
    </>
  );
};

const App: React.FC = () => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const rpcUrl = (import.meta.env.VITE_RPC_URL as string) || '/';

  // Load artifacts/deploy.json if available, otherwise fallback to VITE_CONTRACT_ADDRESS
  useEffect(() => {
    let mounted = true;
    async function loadDeployArtifact() {
      try {
        const res = await fetch('/artifacts/deploy.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (mounted && json?.address) {
            setContractAddress(String(json.address));
            return;
          }
        }
      } catch (e) {
        // ignore fetch errors and fallback to env
      }

      // fallback
      const envAddr = (import.meta.env.VITE_CONTRACT_ADDRESS as string) || '';
      if (mounted && envAddr) {
        setContractAddress(envAddr);
      }
    }
    loadDeployArtifact();
    return () => {
      mounted = false;
    };
  }, []);

  // onConnect handler passed down to WalletModal (and can be used by Header if it triggers modal)
  const handleConnect = useCallback((walletName: string, address?: string) => {
    if (address) setConnectedAddress(address);
    setIsWalletOpen(false);
    // optionally: you can persist last connected wallet or show toast
    console.info('Connected', walletName, address);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {/* RitualProvider gets contractAddress & rpcUrl so child ritual components can use it.
            If your RitualProvider signature differs, adjust the props accordingly. */}
        <RitualProvider contractAddress={contractAddress} rpcUrl={rpcUrl} connectedAddress={connectedAddress}>
          <LanguageProvider>
            <SettingsProvider>
              <PersonaProvider>
                <MeeBotProvider>
                  <AppLayout
                    onOpenWallet={() => setIsWalletOpen(true)}
                    contractAddress={contractAddress}
                    connectedAddress={connectedAddress}
                  />
                  <WalletModal
                    isOpen={isWalletOpen}
                    onClose={() => setIsWalletOpen(false)}
                    onConnect={handleConnect}
                    lang="th"
                  />
                </MeeBotProvider>
              </PersonaProvider>
            </SettingsProvider>
          </LanguageProvider>
        </RitualProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default App;
