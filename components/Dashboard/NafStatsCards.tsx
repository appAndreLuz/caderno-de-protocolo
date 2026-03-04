
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, AlertTriangle, Loader2 } from 'lucide-react';
import { nafService } from '../../services/nafService';

const NafStatsCards: React.FC = () => {
  const [stats, setStats] = useState<{ 
    total: number, 
    naPasta: number, 
    alertas: number,
    aberta: number,
    emCobranca: number,
    baixada: number,
    cancelada: number
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await nafService.getDashboardStats(10); // 10 dias de alerta
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 h-32 rounded-[2rem] animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-primary" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total de NAFs',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-blue-primary',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-100 dark:border-blue-800/30'
    },
    {
      label: 'Na Pasta',
      value: stats?.naPasta || 0,
      icon: Folder,
      color: 'text-lime',
      bgColor: 'bg-lime/10 dark:bg-lime/5',
      borderColor: 'border-lime/20 dark:border-lime/10'
    },
    {
      label: 'Alertas (>10 dias)',
      value: stats?.alertas || 0,
      icon: AlertTriangle,
      color: stats?.alertas && stats.alertas > 0 ? 'text-red-500' : 'text-gray-400',
      bgColor: stats?.alertas && stats.alertas > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-800/50',
      borderColor: stats?.alertas && stats.alertas > 0 ? 'border-red-100 dark:border-red-800/30' : 'border-gray-100 dark:border-slate-800/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-xl shadow-gray-200/40 dark:shadow-none border ${card.borderColor} flex items-center gap-4 transition-all hover:border-lime/50 hover:shadow-lime/10 group`}
        >
          <div className={`w-14 h-14 ${card.bgColor} ${card.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <card.icon size={28} />
          </div>
          <div>
            <h4 className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-wider mb-0.5 opacity-80">{card.label}</h4>
            <p className={`text-3xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NafStatsCards;
