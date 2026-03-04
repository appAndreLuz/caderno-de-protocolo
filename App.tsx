
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, Loader2, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';

// Lazy loading de páginas para reduzir o bundle inicial
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FornecedoresPage = lazy(() => import('./pages/FornecedoresPage'));
const NafsPage = lazy(() => import('./pages/NafsPage'));
const BaixasPage = lazy(() => import('./pages/BaixasPage'));
const MedicamentosPage = lazy(() => import('./pages/MedicamentosPage'));
const CobrancasPage = lazy(() => import('./pages/CobrancasPage'));
const FolhearPage = lazy(() => import('./pages/FolhearPage'));
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage'));
const AdministracaoPage = lazy(() => import('./pages/AdministracaoPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

import Logo from './components/Branding/Logo';

// Componente de Loading para Suspense
const PageLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center py-20">
    <Loader2 className="w-12 h-12 text-[#0A5483] animate-spin mb-4" />
    <p className="text-[#0A5483] font-black uppercase text-xs tracking-widest animate-pulse">
      Carregando Módulo...
    </p>
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('proto_auth') === 'true';
  });
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem('proto_user');
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [psalmRefreshTrigger, setPsalmRefreshTrigger] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('proto_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('proto_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('proto_theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      } else if (window.innerWidth >= 1280) {
        setIsSidebarExpanded(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUser(username);
    localStorage.setItem('proto_auth', 'true');
    localStorage.setItem('proto_user', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('proto_auth');
    localStorage.removeItem('proto_user');
  };

  const handleNavigation = (id: string) => {
    console.log('Navigating to:', id);
    if (id === 'dashboard') {
      setPsalmRefreshTrigger(prev => prev + 1);
    }
    setActiveTab(id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage refreshTrigger={psalmRefreshTrigger} onNavigate={handleNavigation} />;
      case 'fornecedores':
        return <FornecedoresPage />;
      case 'nafs':
        return <NafsPage />;
      case 'baixas':
        return <BaixasPage />;
      case 'medicamentos':
        return <MedicamentosPage />;
      case 'cobrancas':
        return <CobrancasPage />;
      case 'folhear':
        return <FolhearPage />;
      case 'relatorios':
        return <RelatoriosPage />;
      case 'administracao':
        return <AdministracaoPage />;
      default:
        return <PlaceholderPage id={activeTab} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F8EC] dark:bg-[#011627] selection:bg-[#AEDD2B]/30 selection:text-[#02416D] transition-colors duration-300">
      <Sidebar 
        activeId={activeTab}
        onNavigate={handleNavigation}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <motion.div 
        animate={{ 
          paddingLeft: window.innerWidth >= 1024 ? (isSidebarExpanded ? 280 : 80) : 0 
        }}
        transition={{ 
          type: 'tween', 
          ease: [0.4, 0, 0.2, 1], 
          duration: 0.3 
        }}
        className="flex-1 flex flex-col w-full"
        style={{ willChange: 'padding-left' }}
      >
        <header className="lg:hidden h-16 bg-[#0A5483] dark:bg-slate-900 text-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-lg">
          <Logo variant="full" theme="light" size={32} />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-[#066699] rounded-lg transition-colors text-white/80 hover:text-white"
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-[#066699] rounded-lg transition-colors text-white/80 hover:text-white"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 hover:bg-[#066699] rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Desktop Logout & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-4 p-4 absolute top-0 right-0 z-20">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white dark:bg-slate-800 text-[#02416D] dark:text-blue-400 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 border border-gray-100 dark:border-slate-700"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-[#02416D] dark:text-slate-300 hover:text-[#0A5483] dark:hover:text-white font-bold text-sm transition-colors group"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Sair do Sistema</span>
            <LogOut size={18} />
          </button>
        </div>

        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Suspense fallback={<PageLoader />}>
                {renderContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-8 text-center text-gray-400 text-xs border-t border-gray-200/50">
          <p className="font-medium">{user} &bull; <strong>ProtoCaderno</strong> &bull; v1.4.0</p>
          <p className="mt-1 opacity-60 italic">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default App;
