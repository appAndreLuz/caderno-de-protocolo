
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatDate, calculateNafPage, formatCurrency } from '../utils';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Loader2, 
  Activity, 
  Zap, 
  Search,
  Quote,
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  X,
  History,
  TrendingUp,
  LayoutGrid,
  ArrowUpRight,
  Database
} from 'lucide-react';

const PSALMS = [
  { text: "Bem-aventurado o homem que não anda segundo o conselho dos ímpios.", ref: "Salmo 1:1" },
  { text: "Mas tu, Senhor, és um escudo para mim, a minha glória, e o que exalta a minha cabeça.", ref: "Salmo 3:3" },
  { text: "Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança.", ref: "Salmo 4:8" },
  { text: "Pela manhã ouvirás a minha voz, ó Senhor; pela manhã apresentarei a ti a minha oração.", ref: "Salmo 5:3" },
  { text: "O meu escudo é de Deus, que salva os retos de coração.", ref: "Salmo 7:10" },
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmo 119:105" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmo 23:1" },
  { text: "Os que confiam no Senhor serão como o monte Sião, que não se abala, mas permanece para sempre.", ref: "Salmo 125:1" }
];

const DashboardCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
  <div className="group bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 relative overflow-hidden min-h-[180px]">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-1000 ${colorClass.split(' ')[0]}`}></div>
    
    <div className="flex flex-col relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass} shadow-lg shadow-current/20 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] leading-none mb-2">{title}</p>
          <h3 className="text-4xl lg:text-5xl font-black text-gray-900 leading-none tracking-tighter">{value}</h3>
        </div>
      </div>
      
      <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
          {subtitle || 'Métricas Ativas'}
        </span>
        <div className="bg-gray-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <ChevronRight size={12} className="text-gray-400" />
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ type: 'new' | 'done', title: string, subtitle: string, time: string }> = ({ type, title, subtitle, time }) => (
  <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-[1.5rem] transition-all group cursor-default border border-transparent hover:border-gray-100">
    <div className={`p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${type === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
      {type === 'new' ? <Zap size={16} /> : <CheckCircle2 size={16} />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-0.5">
        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate">{title}</p>
        <span className="text-[8px] font-black text-gray-300 uppercase shrink-0 ml-2">{time}</span>
      </div>
      <p className="text-[10px] text-gray-400 uppercase font-bold truncate leading-tight tracking-wider">{subtitle}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalNafs: 0,
    activeNafs: 0,
    baixasToday: 0,
    fornecedores: 0,
    nearExpiry30Meds: 0,
    expiredMeds: 0,
    avgLeadTime: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomPsalm, setRandomPsalm] = useState(PSALMS[0]);
  const [greeting, setGreeting] = useState({ text: '', icon: Sun });
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<(NAF & { page: number })[]>([]);
  const [searchExecuted, setSearchExecuted] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting({ text: 'BOM DIA', icon: Sun });
    else if (hour >= 12 && hour < 18) setGreeting({ text: 'BOA TARDE', icon: CloudSun });
    else setGreeting({ text: 'BOA NOITE', icon: Moon });

    const randomIndex = Math.floor(Math.random() * PSALMS.length);
    setRandomPsalm(PSALMS[randomIndex]);

    const fetchDashboardData = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const next30Str = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [totalRes, activeRes, supplierRes, baixasTodayRes, expiredRes, near30Res, leadTimeDataRes] = await Promise.all([
          supabase.from('nafs').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).is('data_baixa', null),
          supabase.from('fornecedores').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).eq('data_baixa', todayStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).lt('validade', todayStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).gte('validade', todayStr).lte('validade', next30Str),
          supabase.from('nafs').select('data_entrada, data_baixa').not('data_baixa', 'is', null)
        ]);

        let avgLT = 0;
        if (leadTimeDataRes.data && leadTimeDataRes.data.length > 0) {
          const totalDays = leadTimeDataRes.data.reduce((acc, curr) => {
            const start = new Date(curr.data_entrada);
            const end = new Date(curr.data_baixa!);
            return acc + Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          }, 0);
          avgLT = Math.round(totalDays / leadTimeDataRes.data.length);
        }

        const [recentCreated, recentFinished] = await Promise.all([
          supabase.from('nafs').select('*, fornecedor:fornecedores(*)').order('created_at', { ascending: false }).limit(5),
          supabase.from('nafs').select('*, fornecedor:fornecedores(*)').not('data_baixa', 'is', null).order('data_baixa', { ascending: false }).limit(5)
        ]);

        const combinedActivity = [
          ...(recentCreated.data || []).map(n => ({ ...n, actType: 'new', actTime: n.created_at })),
          ...(recentFinished.data || []).map(n => ({ ...n, actType: 'done', actTime: n.data_baixa }))
        ].sort((a, b) => new Date(b.actTime).getTime() - new Date(a.actTime).getTime()).slice(0, 5);

        setStats({
          totalNafs: totalRes.count || 0,
          activeNafs: activeRes.count || 0,
          baixasToday: baixasTodayRes.count || 0,
          fornecedores: supplierRes.count || 0,
          nearExpiry30Meds: near30Res.count || 0,
          expiredMeds: expiredRes.count || 0,
          avgLeadTime: avgLT
        });

        setRecentActivity(combinedActivity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchExecuted(true);
    
    try {
      const { data: searchData, error: searchError } = await supabase
        .from('nafs')
        .select('*, fornecedor:fornecedores(*)')
        .or(`numero_naf.eq.${quickSearchTerm.trim()},fornecedor_id.eq.${quickSearchTerm.trim()}`)
        .order('numero_subnaf', { ascending: true });

      if (searchError) throw searchError;

      if (searchData && searchData.length > 0) {
        const enriched = await Promise.all(searchData.map(async (n) => {
          const { count } = await supabase
            .from('nafs')
            .select('id', { count: 'exact', head: true })
            .lt('created_at', n.created_at!);
          
          return { ...n, page: calculateNafPage(count || 0) };
        }));
        setSearchResults(enriched);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Busca falhou:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen space-y-6">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <Activity size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
      </div>
      <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Sincronizando Ecossistema...</p>
    </div>
  );

  const GreetingIcon = greeting.icon;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      
      {/* 1. Header & Quick Search */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between bg-white/40 p-8 rounded-[2.5rem] backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-4 rounded-2xl text-white shadow-xl shadow-blue-500/20 transform transition-transform hover:scale-105 active:rotate-3">
            <GreetingIcon size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles size={14} className="text-amber-400 fill-amber-400" />
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none italic">
                {greeting.text}, <span className="text-blue-600">ANDRÉ</span>
              </h1>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Painel de Auditoria Corporativa</p>
          </div>
        </div>

        <form onSubmit={handleQuickSearch} className="relative group flex-1 max-w-md">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className={`transition-colors duration-500 ${isSearching ? 'text-blue-600' : 'text-gray-300'}`} size={20} />
          </div>
          <input
            type="text"
            placeholder="Nº NAF OU IDENTIFICADOR..."
            value={quickSearchTerm}
            onChange={(e) => setQuickSearchTerm(e.target.value)}
            className={`w-full pl-14 pr-32 py-5 bg-white border border-gray-100 rounded-[1.8rem] shadow-sm focus:ring-[12px] focus:ring-blue-600/5 outline-none font-black text-[12px] uppercase tracking-widest transition-all duration-500 ${isSearching ? 'border-blue-600/30' : 'border-gray-100'}`}
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'LOCALIZAR'}
          </button>
        </form>
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Consolidado NAF" 
          value={stats.totalNafs} 
          icon={FileText} 
          colorClass="bg-blue-600 text-white" 
          subtitle="Volume Histórico"
        />
        <DashboardCard 
          title="Operação Ativa" 
          value={stats.activeNafs} 
          icon={Clock} 
          colorClass="bg-amber-500 text-white" 
          subtitle="Pendências em Pasta"
        />
        <DashboardCard 
          title="Fluxo de Saída" 
          value={stats.baixasToday} 
          icon={CheckCircle2} 
          colorClass="bg-emerald-500 text-white" 
          subtitle="Processamento Hoje"
        />
        <DashboardCard 
          title="Parceiros" 
          value={stats.fornecedores} 
          icon={Users} 
          colorClass="bg-indigo-600 text-white" 
          subtitle="Base Homologada"
        />
      </div>

      {/* 3. Search Results */}
      {searchExecuted && (
        <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-3xl animate-scaleIn relative overflow-hidden border border-white/5">
          <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12 scale-150">
            <Database size={300} />
          </div>
          <button onClick={() => setSearchExecuted(false)} className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-all z-20"><X size={24} /></button>
          
          <div className="flex items-center space-x-5 mb-10 relative z-10">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl">
              <Search size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Resultado da Auditoria</h3>
              <p className="text-[10px] font-bold text-blue-400 uppercase mt-2 tracking-widest">Localizando: {quickSearchTerm}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {isSearching ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                 <Loader2 size={32} className="animate-spin text-blue-400" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Varrendo Registros...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Nenhum protocolo localizado.</p>
              </div>
            ) : (
              searchResults.map(res => (
                <div key={res.id} className="bg-white rounded-[2rem] p-8 shadow-3xl group hover:scale-[1.01] transition-all duration-500 border border-gray-100">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 leading-none">Identificador NAF</p>
                      <h4 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                        {res.numero_naf} <span className="text-gray-200">/</span> {res.numero_subnaf}
                      </h4>
                    </div>
                    <div className={`p-2.5 rounded-xl ${res.data_baixa ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {res.data_baixa ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                      <MapPin size={18} className="text-blue-600" />
                      <p className="text-[13px] font-black uppercase truncate tracking-tight text-gray-800 leading-none">
                        {res.fornecedor?.razao_social || 'N/D'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Entrada</p>
                        <span className="text-[12px] font-black text-gray-700">{formatDate(res.data_entrada)}</span>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-[1.5rem] border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-600/50 uppercase tracking-widest mb-1 leading-none">Valor</p>
                        <span className="text-[12px] font-black text-emerald-600">{formatCurrency(res.valor)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 leading-none">Posição no Livro</p>
                      <span className="text-xl font-black text-blue-600 leading-none italic">FOLHA #{res.page}</span>
                    </div>
                    <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-lg">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Meditation Area */}
      <div className="bg-white/60 p-10 rounded-[3rem] border border-white shadow-sm relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-blue-900 pointer-events-none">
          <Quote size={100} />
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10 relative z-10">
          <div className="p-6 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-500/20 transform rotate-3">
            <Quote size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Meditação Corporativa</p>
            <div className="flex flex-col gap-4">
              <p className="text-xl md:text-2xl font-medium text-gray-800 italic leading-relaxed font-serif max-w-4xl">
                "{randomPsalm.text}"
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <span className="w-12 h-[3px] bg-blue-100 rounded-full"></span>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-full border border-blue-100">{randomPsalm.ref}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 bg-white p-8 lg:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 text-blue-600 rounded-[1.2rem] border border-gray-100">
                <History size={22} />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Timeline Operacional</h3>
            </div>
            <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center group">
              AUDITAR FLUXO <ChevronRight size={12} className="ml-1.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => (
                <ActivityItem 
                  key={i}
                  type={act.actType as 'new' | 'done'}
                  title={`NAF ${act.numero_naf}/${act.numero_subnaf}`}
                  subtitle={act.fornecedor?.razao_social || 'Identificador Ausente'}
                  time={formatDate(act.actTime)}
                />
              ))
            ) : (
              <div className="py-20 text-center">
                 <LayoutGrid size={40} className="mx-auto text-gray-100 mb-4" />
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Aguardando Sincronização</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 to-indigo-950 p-8 lg:p-10 rounded-[2.5rem] text-white shadow-3xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <TrendingUp size={220} />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center space-x-4 mb-10">
              <div className="p-3 bg-white/10 rounded-[1.2rem] backdrop-blur-xl border border-white/20">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none">Ciclo de Saída</h3>
            </div>

            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-8xl font-black tracking-tighter leading-none">{stats.avgLeadTime}</span>
              <span className="text-xl font-black text-blue-400 uppercase tracking-widest italic">Dias</span>
            </div>
            
            <p className="text-[11px] font-bold text-blue-200/60 uppercase tracking-widest mb-10 max-w-[240px] leading-relaxed">
              Média temporal entre o registro de entrada e a baixa final.
            </p>

            <div className="mt-auto grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
               <div className="bg-white/5 p-4 rounded-[1.8rem] border border-white/10 transition-colors hover:bg-white/10 group/item">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Vencidos</p>
                  <p className="text-3xl font-black group-hover/item:text-red-400 transition-colors">{stats.expiredMeds}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-[1.8rem] border border-white/10 transition-colors hover:bg-white/10 group/item">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Em Alerta</p>
                  <p className="text-3xl font-black group-hover/item:text-amber-400 transition-colors">{stats.nearExpiry30Meds}</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
