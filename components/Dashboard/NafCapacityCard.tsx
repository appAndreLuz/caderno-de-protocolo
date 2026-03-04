
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface NafCapacityData {
  total_nafs: number;
  capacidade_maxima: number;
  percentual_utilizado: number;
  percentual_restante: number;
}

const NafCapacityCard: React.FC = () => {
  const [data, setData] = useState<NafCapacityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/nafs-capacidade', {
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Erro ao buscar capacidade:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-slate-700 h-[350px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#0A5483]/10 border-t-[#AEDD2B] rounded-full animate-spin" />
        <p className="text-[#02416D] dark:text-slate-400 font-black uppercase tracking-widest text-[9px]">Carregando Capacidade...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-slate-700 h-[350px] flex flex-col items-center justify-center text-center gap-4">
        <AlertTriangle className="text-red-500" size={32} />
        <p className="text-gray-500 font-bold uppercase text-[10px]">Erro ao carregar dados</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Utilizado', value: data.total_nafs },
    { name: 'Restante', value: Math.max(0, data.capacidade_maxima - data.total_nafs) },
  ];

  // Cores baseadas no percentual
  const getStatusColor = (percent: number) => {
    if (percent >= 91) return '#ef4444'; // Red
    if (percent >= 71) return '#f59e0b'; // Amber
    return '#AEDD2B'; // Institutional Green
  };

  const statusColor = getStatusColor(data.percentual_utilizado);
  const isCritical = data.percentual_utilizado >= 91;
  const isAttention = data.percentual_utilizado >= 71 && data.percentual_utilizado < 91;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-700 flex flex-col h-full transition-all hover:shadow-[#AEDD2B]/10 group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[#02416D] dark:text-white font-bold uppercase text-[11px] tracking-widest mb-0.5 opacity-80">Capacidade do Caderno</h4>
          <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">100 Páginas / 3.100 NAFs</p>
        </div>
        <div className={`p-2.5 rounded-2xl transition-transform group-hover:scale-110 ${isCritical ? 'bg-red-50 dark:bg-red-900/20 text-red-500 shadow-lg shadow-red-500/10' : isAttention ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-[#F8F8EC] dark:bg-slate-700 text-[#AEDD2B] shadow-lg shadow-[#AEDD2B]/10'}`}>
          {isCritical ? <AlertTriangle size={20} /> : isAttention ? <Info size={20} /> : <CheckCircle2 size={20} />}
        </div>
      </div>

      <div className="flex-1 relative min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={450}
            >
              <Cell fill={statusColor} className="drop-shadow-lg" />
              <Cell fill={document.body.classList.contains('dark') ? '#1e293b' : '#F1F5F9'} />
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as any;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                      <text x={cx} y={cy - 5} className="text-3xl font-bold fill-[#02416D] dark:fill-white tracking-tighter">
                        {Math.round(data.percentual_utilizado)}%
                      </text>
                      <text x={cx} y={cy + 20} className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500 uppercase tracking-widest">
                        Utilizado
                      </text>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-slate-900/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: statusColor }} />
            <span className="text-[11px] font-bold text-[#02416D] dark:text-slate-300 uppercase tracking-wide">Cadastrados</span>
          </div>
          <span className="text-xs font-bold text-[#02416D] dark:text-white">{data.total_nafs.toLocaleString()} NAFs</span>
        </div>
        
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-slate-900/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 shadow-sm" />
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Disponível</span>
          </div>
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500">{(data.capacidade_maxima - data.total_nafs).toLocaleString()} NAFs</span>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <AnimatePresence mode="wait">
            {isCritical ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3"
              >
                <AlertTriangle className="text-red-500 shrink-0" size={16} />
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase leading-tight tracking-tight">
                  Capacidade Crítica! Inicie um novo caderno.
                </p>
              </motion.div>
            ) : isAttention ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3"
              >
                <Info className="text-amber-500 shrink-0" size={16} />
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase leading-tight tracking-tight">
                  Atenção: Ocupação acima de 70%.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#F8F8EC] dark:bg-slate-900/50 p-3 rounded-2xl border border-[#AEDD2B]/20 dark:border-lime/10 flex items-center gap-3"
              >
                <CheckCircle2 className="text-[#AEDD2B] shrink-0" size={16} />
                <p className="text-[10px] font-bold text-[#02416D] dark:text-slate-300 uppercase leading-tight tracking-tight">
                  Sistema operando com margem ideal.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NafCapacityCard;
