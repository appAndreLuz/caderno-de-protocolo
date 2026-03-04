
import React from 'react';
import GreetingCard from '../components/Dashboard/GreetingCard';
import PsalmCard from '../components/Dashboard/PsalmCard';
import NafCapacityCard from '../components/Dashboard/NafCapacityCard';
import NafStatsCards from '../components/Dashboard/NafStatsCards';
import QuickSearchCard from '../components/Dashboard/QuickSearchCard';
import GlobalStatusCard from '../components/Dashboard/GlobalStatusCard';
import { Users, FileText, Pill, PlusCircle, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardPageProps {
  refreshTrigger: number;
  onNavigate: (id: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ refreshTrigger, onNavigate }) => {
  const shortcuts = [
    { id: 'fornecedores', label: 'Cadastrar Fornecedor', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'nafs', label: 'Cadastrar NAF', icon: FileText, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'medicamentos', label: 'Cadastrar Medicamento', icon: Pill, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Top Section */}
      <motion.div variants={itemVariants}>
        <GreetingCard />
      </motion.div>

      {/* NAF Statistics Cards */}
      <motion.div variants={itemVariants}>
        <NafStatsCards />
      </motion.div>

      {/* Quick Shortcuts Section - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shortcuts.map((shortcut) => (
          <motion.button
            key={shortcut.id}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(shortcut.id)}
            className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-700 flex items-center gap-4 text-left group transition-all hover:border-[#AEDD2B] dark:hover:border-[#AEDD2B] hover:shadow-[#AEDD2B]/10"
          >
            <div className={`w-12 h-12 ${shortcut.bgColor} ${shortcut.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <shortcut.icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[#02416D] dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-0.5 opacity-70">Atalho Rápido</h4>
              <p className="text-base font-bold text-[#02416D] dark:text-white truncate">{shortcut.label}</p>
            </div>
            <PlusCircle size={18} className="text-gray-300 dark:text-slate-600 group-hover:text-[#AEDD2B] transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Grid Content - Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div variants={itemVariants}>
            <PsalmCard refreshTrigger={refreshTrigger} />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="h-full">
              <NafCapacityCard />
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-700 flex flex-col justify-center items-center text-center group hover:border-[#AEDD2B] dark:hover:border-[#AEDD2B] transition-all hover:shadow-[#AEDD2B]/10"
            >
              <div className="w-14 h-14 bg-[#F8F8EC] dark:bg-slate-700 rounded-3xl flex items-center justify-center mb-4 text-[#066699] dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
                <FileText size={28} />
              </div>
              <h4 className="font-bold text-[#02416D] dark:text-white uppercase text-[10px] tracking-wider mb-1">Relatórios Rápidos</h4>
              <p className="text-[9px] text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wide mb-4">Acesse métricas detalhadas</p>
              <button 
                onClick={() => onNavigate('relatorios')}
                className="px-6 py-2.5 bg-gradient-to-br from-[#0A5483] to-[#02416D] dark:from-blue-600 dark:to-blue-800 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest hover:shadow-lg hover:shadow-blue-900/20 transition-all active:scale-95"
              >
                Visualizar
              </button>
            </motion.div>
          </div>
        </div>

        {/* Sidebar/Stats Column */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={itemVariants}>
            <QuickSearchCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlobalStatusCard />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
