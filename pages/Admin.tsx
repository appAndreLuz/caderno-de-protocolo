
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  Shield, 
  Database, 
  Book, 
  Loader2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Activity, 
  Lock, 
  Signal, 
  Zap, 
  Bell, 
  Smartphone, 
  AlertTriangle,
  Cpu,
  Globe,
  Server
} from 'lucide-react';

const Admin: React.FC = () => {
  const [totalNafs, setTotalNafs] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  
  const [connStatus, setConnStatus] = useState<'online' | 'offline' | 'unstable' | 'checking'>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  const [alertSettings, setAlertSettings] = useState({
    browserNotifications: true,
    nafThreshold: 10
  });

  const CAPACITY = 3100; 

  const checkConnection = async () => {
    const start = performance.now();
    try {
      const { error } = await supabase.from('nafs').select('id').limit(1);
      const end = performance.now();
      const diff = Math.round(end - start);
      if (error) throw error;
      setLatency(diff);
      setConnStatus(diff > 1200 ? 'unstable' : 'online');
    } catch (err) {
      setConnStatus('offline');
      setLatency(null);
    }
  };

  const fetchStats = async () => {
    setRefreshing(true);
    await checkConnection();
    const { count, error } = await supabase
      .from('nafs')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      setTotalNafs(count);
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const percentage = Math.min(Math.round((totalNafs / CAPACITY) * 100), 100);
  const pagesUsed = Math.ceil(totalNafs / 31);
  
  const getProgressColor = () => {
    if (percentage > 90) return '#ef4444'; 
    if (percentage > 70) return '#f59e0b'; 
    return '#2563eb'; // blue-600
  };

  const getStatusConfig = () => {
    switch (connStatus) {
      case 'online': return { label: 'Conectado', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Wifi };
      case 'unstable': return { label: 'Instável', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertTriangle };
      case 'offline': return { label: 'Desconectado', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: WifiOff };
      default: return { label: 'Verificando', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100', icon: Activity };
    }
  };

  const statusCfg = getStatusConfig();
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Acessando área restrita...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Re-estilizado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-5">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl rotate-3">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Administração</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Console de Monitoramento e Segurança</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center space-x-3 px-5 py-2.5 rounded-2xl border ${statusCfg.bg} ${statusCfg.border} transition-all duration-500`}>
            <div className="relative flex h-3 w-3">
              {connStatus === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${statusCfg.color.replace('text', 'bg')}`}></span>
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>

          <button 
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Sincronizando' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel de Capacidade (Maior destaque) */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="w-full mb-8">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Database size={20} />
              </div>
              <h2 className="font-black text-gray-800 uppercase text-xs tracking-[0.2em]">Volume de Dados</h2>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-10">
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-2xl">
              <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f8fafc" strokeWidth={strokeWidth} fill="transparent" />
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke={getProgressColor()}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">{percentage}%</span>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Ocupado</p>
            </div>
          </div>

          <div className="w-full space-y-4">
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total de NAFs</span>
                <span className="font-black text-gray-800 text-sm">{totalNafs.toLocaleString('pt-BR')}</span>
             </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uso de Folhas</span>
                <span className="font-black text-gray-800 text-sm">{pagesUsed} <span className="text-gray-300">/</span> 100</span>
             </div>
          </div>
          
          <div className="mt-8 text-center">
             <span className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">Capacidade Máxima: 3.100 Registros</span>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {/* Configurações de Inteligência */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-10">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Inteligência de Alertas</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Automação e Regras de Negócio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl text-gray-400 group-hover:text-blue-600 transition-colors">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-800 uppercase">Push Nativo</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Navegador</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={alertSettings.browserNotifications}
                      onChange={(e) => setAlertSettings({...alertSettings, browserNotifications: e.target.checked})}
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start space-x-4">
                   <Zap size={20} className="text-blue-500 shrink-0 mt-1" />
                   <p className="text-xs text-blue-800 leading-relaxed font-medium">
                     O processamento de alertas é executado no lado do servidor. Notificações de e-mail foram migradas para o <span className="font-black">Dashboard Central</span>.
                   </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Limite de Estagnação (Dias)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={alertSettings.nafThreshold}
                      onChange={(e) => setAlertSettings({...alertSettings, nafThreshold: parseInt(e.target.value) || 0})}
                      className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-lg font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs uppercase">Dias</div>
                  </div>
                </div>
                <p className="mt-4 text-[9px] text-gray-400 font-bold uppercase leading-relaxed px-2">
                  Protocolos sem baixa após este prazo serão marcados como <span className="text-amber-500">Críticos</span> no sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Status Infra (Novo Estilo Scorecard) */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
             <div className="flex items-center space-x-3 mb-8">
               <Server size={22} className="text-blue-600" />
               <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Status de Infraestrutura</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ping do Banco</p>
                    <Activity size={14} className="text-gray-300" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                     <p className={`text-4xl font-black tracking-tighter transition-colors ${latency && latency > 1200 ? 'text-amber-500' : 'text-gray-900'}`}>
                       {latency || '--'}
                     </p>
                     <span className="text-xs font-black text-gray-400 uppercase">ms</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${latency && latency > 1200 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: latency ? `${Math.min((latency / 2000) * 100, 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Certificação SSL</p>
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Lock size={20} />
                     </div>
                     <div>
                       <p className="text-sm font-black text-gray-800 uppercase tracking-tight">TLS 1.3</p>
                       <p className="text-[9px] font-black text-emerald-500 uppercase">Criptografia Ativa</p>
                     </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Persistência</p>
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Globe size={20} />
                     </div>
                     <div>
                       <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Supabase</p>
                       <p className="text-[9px] font-black text-blue-500 uppercase">Sincronização Real-time</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
