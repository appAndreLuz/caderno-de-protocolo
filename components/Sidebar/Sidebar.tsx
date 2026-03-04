
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, LogOut, Sun, Moon } from 'lucide-react';
import { MENU_ITEMS } from '../../constants';
import SidebarItem from './SidebarItem';
import Logo from '../Branding/Logo';

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeId, 
  onNavigate, 
  isExpanded, 
  setIsExpanded,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
  isDarkMode,
  setIsDarkMode
}) => {
  // Configuração de transição otimizada para performance
  const sidebarTransition = {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1], // Standard easing para dashboards corporativos
    duration: 0.3
  } as const;

  const handleItemClick = (id: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(id);
    } else {
      console.error('onNavigate is not a function in Sidebar', { onNavigate });
    }
    if (window.innerWidth < 1024) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#02416D]/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isExpanded ? 280 : 80,
          x: isMobileOpen || window.innerWidth >= 1024 ? 0 : -280
        }}
        transition={sidebarTransition}
        style={{ willChange: 'width, transform' }}
        className="fixed top-0 left-0 h-full z-50 bg-[#0A5483] dark:bg-slate-900 text-white shadow-2xl flex flex-col overflow-hidden border-r border-white/5 dark:border-slate-800"
      >
        {/* Header/Logo Branding */}
        <div className="h-24 flex items-center justify-between px-5 border-b border-[#066699]/50 dark:border-slate-800 shrink-0">
          <div className="flex items-center overflow-hidden">
            <Logo 
              variant={isExpanded ? 'full' : 'icon'} 
              theme="light" 
              size={isExpanded ? 38 : 42}
            />
          </div>
          
          {isExpanded && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-[#066699] rounded-lg transition-colors text-white/70 hover:text-white hidden lg:flex"
            >
              <ChevronLeft size={20} />
            </motion.button>
          )}

          {!isExpanded && (
             <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(true)}
              className="absolute right-2 p-1 bg-[#066699] rounded-full hidden lg:flex shadow-lg"
            >
              <ChevronRight size={14} />
            </motion.button>
          )}
          
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 hover:bg-[#066699] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-2 no-scrollbar scroll-smooth">
          <div className="flex flex-col gap-1">
            {MENU_ITEMS.map((item) => (
              <SidebarItem 
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                isExpanded={isExpanded}
                onClick={handleItemClick}
              />
            ))}
          </div>
        </nav>

        {/* Theme Toggle & Logout Section */}
        <div className="px-4 py-2 flex flex-col gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              isExpanded ? 'w-full' : 'w-10 h-10 justify-center mx-auto'
            } hover:bg-white/10 text-white/70 hover:text-white`}
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            {isExpanded && <span className="text-xs font-bold uppercase tracking-widest">Tema {isDarkMode ? 'Claro' : 'Escuro'}</span>}
          </button>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-[#066699]/50 dark:border-slate-800 bg-[#02416D]/30 dark:bg-slate-900/50 shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            {isExpanded ? (
              <motion.div 
                key="expanded-footer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={sidebarTransition}
                className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#AEDD2B] flex items-center justify-center text-[#02416D] font-bold text-sm shrink-0 shadow-md">
                    AL
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0A5483] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">André Luz</p>
                  <p className="text-[10px] text-white/50 truncate uppercase font-medium">Gestor Sênior</p>
                </div>
                <motion.button 
                  onClick={onLogout}
                  whileHover={{ scale: 1.1, color: '#ff4444' }}
                  className="text-white/40 transition-colors"
                  title="Sair do sistema"
                >
                  <LogOut size={18} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="collapsed-footer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={sidebarTransition}
                className="flex justify-center"
              >
                <button 
                  onClick={onLogout}
                  title="Sair do sistema"
                  className="relative group active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#AEDD2B] flex items-center justify-center text-[#02416D] font-bold text-sm shrink-0 shadow-md group-hover:bg-[#ff4444] group-hover:text-white transition-colors">
                    AL
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0A5483] rounded-full group-hover:bg-red-200 transition-colors" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
