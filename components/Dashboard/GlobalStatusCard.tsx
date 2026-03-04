
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Ban, XCircle, Loader2 } from 'lucide-react';
import { nafService } from '../../services/nafService';

const GlobalStatusCard: React.FC = () => {
  const [stats, setStats] = useState<{ 
    aberta: number, 
    emCobranca: number, 
    baixada: number, 
    cancelada: number 
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await nafService.getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#02416D] to-[#011627] p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-center min-h-[120px]">
        <Loader2 className="animate-spin text-[#AEDD2B]" size={24} />
      </div>
    );
  }

  const items = [
    { label: 'Aberto', value: stats?.aberta || 0, icon: CheckCircle2, color: 'text-[#AEDD2B]' },
    { label: 'Cobrança', value: stats?.emCobranca || 0, icon: Clock, color: 'text-blue-300' },
    { label: 'Baixado', value: stats?.baixada || 0, icon: Ban, color: 'text-slate-400' },
    { label: 'Cancelado', value: stats?.cancelada || 0, icon: XCircle, color: 'text-red-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#02416D] to-[#011627] dark:from-slate-900 dark:to-black p-5 rounded-[2rem] shadow-xl text-white relative overflow-hidden group"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-bold text-[#AEDD2B] uppercase tracking-widest opacity-80">Status Global</p>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#AEDD2B] animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-[#AEDD2B] animate-pulse delay-75" />
            <div className="w-1 h-1 rounded-full bg-[#AEDD2B] animate-pulse delay-150" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className={`p-1.5 rounded-lg bg-white/5 ${item.color}`}>
                <item.icon size={14} />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase leading-none mb-1">{item.label}</p>
                <p className="text-sm font-black leading-none">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#AEDD2B]/5 rounded-full blur-2xl group-hover:bg-[#AEDD2B]/10 transition-colors" />
    </motion.div>
  );
};

export default GlobalStatusCard;
