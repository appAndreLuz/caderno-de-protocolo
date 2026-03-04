
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Server,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DbStats {
  total_space: string;
  used_space: string;
  percentage: string;
  status: 'Normal' | 'Atenção' | 'Crítico';
  last_update: string;
}

interface HealthStatus {
  status: string;
  db_status: string;
  api_status: string;
  response_time: number;
  last_check: string;
}

const AdministracaoPage: React.FC = () => {
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/db-stats'),
        fetch('/api/health-check')
      ]);

      if (statsRes.ok && healthRes.ok) {
        const statsData = await statsRes.json();
        const healthData = await healthRes.json();
        setDbStats(statsData);
        setHealth(healthData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Auto refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
      case 'Operacional':
      case 'Conectado':
      case 'Online':
        return 'text-green-500';
      case 'Atenção':
      case 'Instável':
        return 'text-amber-500';
      case 'Crítico':
      case 'Indisponível':
      case 'Offline':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getBgColor = (status: string) => {
    switch (status) {
      case 'Normal':
      case 'Operacional':
        return 'bg-green-500';
      case 'Atenção':
      case 'Instável':
        return 'bg-amber-500';
      case 'Crítico':
      case 'Indisponível':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-[#0A5483]" size={48} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Carregando Infraestrutura...</p>
      </div>
    );
  }

  const isSystemHealthy = health?.status === 'Operacional' && dbStats?.status === 'Normal';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#02416D] tracking-tight">Administração</h2>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <Settings size={16} className="text-[#AEDD2B]" />
            Monitoramento técnico e estratégico do sistema.
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          className="bg-white text-[#0A5483] border-2 border-[#0A5483]/10 px-6 py-3 rounded-2xl font-black shadow-sm hover:border-[#AEDD2B] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
          ATUALIZAR STATUS
        </button>
      </div>

      {/* Health Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-[2rem] flex items-center gap-4 ${
          isSystemHealthy ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'
        }`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          isSystemHealthy ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {isSystemHealthy ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div>
          <h3 className={`text-lg font-black ${isSystemHealthy ? 'text-green-800' : 'text-amber-800'}`}>
            {isSystemHealthy ? 'Sistema Totalmente Saudável' : 'Atenção Requerida na Infraestrutura'}
          </h3>
          <p className={`text-sm font-medium ${isSystemHealthy ? 'text-green-600' : 'text-amber-600'}`}>
            {isSystemHealthy 
              ? 'Todos os serviços estão operando dentro dos parâmetros normais.' 
              : 'Alguns indicadores apresentam instabilidade ou carga elevada.'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Volume Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-[#F8F8EC] rounded-2xl flex items-center justify-center text-[#AEDD2B]">
              <Database size={28} />
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 ${getStatusColor(dbStats?.status || '')}`}>
              Status: {dbStats?.status}
            </div>
          </div>

          <h3 className="text-2xl font-black text-[#02416D] mb-6">Volume de Dados</h3>
          
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-black text-[#02416D] tracking-tighter">{dbStats?.percentage}%</span>
                <span className="text-gray-400 font-bold ml-2 uppercase text-xs tracking-widest">Ocupado</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uso Atual</p>
                <p className="text-sm font-bold text-[#02416D]">{dbStats?.used_space} / {dbStats?.total_space}</p>
              </div>
            </div>

            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${dbStats?.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${getBgColor(dbStats?.status || '')}`}
              />
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <motion.span 
                key={dbStats?.last_update}
                initial={{ opacity: 0.5, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1"
              >
                <Clock size={12} />
                Atualizado em: {new Date(dbStats?.last_update || '').toLocaleTimeString()}
              </motion.span>
              <span>Supabase Cloud</span>
            </div>
          </div>
        </motion.div>

        {/* Infrastructure Status Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-[#F8F8EC] rounded-2xl flex items-center justify-center text-[#AEDD2B]">
              <Activity size={28} />
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 ${getStatusColor(health?.status || '')}`}>
              {health?.status}
            </div>
          </div>

          <h3 className="text-2xl font-black text-[#02416D] mb-6">Status de Infraestrutura</h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Server size={20} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-600">Banco de Dados</span>
              </div>
              <span className={`text-sm font-black uppercase tracking-widest ${getStatusColor(health?.db_status || '')}`}>
                {health?.db_status}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-600">API Gateway</span>
              </div>
              <span className={`text-sm font-black uppercase tracking-widest ${getStatusColor(health?.api_status || '')}`}>
                {health?.api_status}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-600">Tempo de Resposta</span>
              </div>
              <motion.span 
                key={health?.response_time}
                initial={{ opacity: 0, scale: 1.1, color: '#AEDD2B' }}
                animate={{ opacity: 1, scale: 1, color: (health?.response_time || 0) > 500 ? '#f59e0b' : '#22c55e' }}
                className="text-sm font-black uppercase tracking-widest"
              >
                {health?.response_time} ms
              </motion.span>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <motion.span 
                key={health?.last_check}
                initial={{ opacity: 0.5, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1"
              >
                <Clock size={12} />
                Verificado em: {new Date(health?.last_check || '').toLocaleTimeString()}
              </motion.span>
              <span>Health Check OK</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdministracaoPage;
