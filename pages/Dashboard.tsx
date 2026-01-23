
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatDate } from '../utils';
import { FileText, CheckCircle2, Clock, Users, Loader2, ShieldAlert, Sparkles, History, Quote, Book } from 'lucide-react';

const PSALMS = [
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmo 23:1" },
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmo 119:105" },
  { text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", ref: "Salmo 91:1" },
  { text: "Elevo os meus olhos para os montes; de onde virá o meu socorro? O meu socorro vem do Senhor.", ref: "Salmo 121:1-2" },
  { text: "O Senhor te guardará de todo o mal; ele guardará a tua alma.", ref: "Salmo 121:7" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", ref: "Salmo 37:5" },
  { text: "Cantai ao Senhor um cântico novo, cantai ao Senhor todas as terras.", ref: "Salmo 96:1" },
  { text: "Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.", ref: "Salmo 91:7" },
  { text: "Este é o dia que fez o Senhor; regozijemo-nos, e alegremo-nos nele.", ref: "Salmo 118:24" },
  { text: "O que confia no Senhor é como o monte Sião, que não se abala, mas permanece para sempre.", ref: "Salmo 125:1" }
];

const DashboardCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium whitespace-nowrap">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalNafs: 0,
    activeNafs: 0,
    baixasToday: 0,
    fornecedores: 0,
    incompleteSuppliers: 0,
    nearExpiry30Meds: 0,
    nearExpiry60Meds: 0,
    expiredMeds: 0
  });
  const [oldestNaf, setOldestNaf] = useState<NAF | null>(null);
  const [loading, setLoading] = useState(true);
  const [randomPsalm, setRandomPsalm] = useState(PSALMS[0]);

  useEffect(() => {
    // Sorteia um salmo ao entrar no Dashboard
    const randomIndex = Math.floor(Math.random() * PSALMS.length);
    setRandomPsalm(PSALMS[randomIndex]);

    const fetchStats = async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const next30DaysStr = next30Days.toISOString().split('T')[0];

        const next60Days = new Date();
        next60Days.setDate(today.getDate() + 60);
        const next60DaysStr = next60Days.toISOString().split('T')[0];
        
        const [totalRes, activeRes, supplierRes, baixasRes, incompleteRes, near30Res, near60Res, expiredRes, oldestRes] = await Promise.all([
          supabase.from('nafs').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).is('data_baixa', null),
          supabase.from('fornecedores').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).eq('data_baixa', todayStr),
          supabase.from('fornecedores').select('id', { count: 'exact', head: true }).or('telefone.is.null,email.is.null,telefone.eq."",email.eq.""'),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).gte('validade', todayStr).lte('validade', next30DaysStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).gt('validade', next30DaysStr).lte('validade', next60DaysStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).lt('validade', todayStr),
          supabase.from('nafs').select('*, fornecedor:fornecedores(*)').is('data_baixa', null).order('data_entrada', { ascending: true }).limit(1).maybeSingle()
        ]);

        setStats({
          totalNafs: totalRes.count || 0,
          activeNafs: activeRes.count || 0,
          baixasToday: baixasRes.count || 0,
          fornecedores: supplierRes.count || 0,
          incompleteSuppliers: incompleteRes.count || 0,
          nearExpiry30Meds: near30Res.count || 0,
          nearExpiry60Meds: near60Res.count || 0,
          expiredMeds: expiredRes.count || 0
        });

        if (oldestRes.data) {
          setOldestNaf(oldestRes.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getDaysWaiting = (dateStr: string) => {
    const start = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-400 font-medium animate-pulse">Sincronizando visão geral...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12 text-sm">
      {/* Welcome Hero */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 text-blue-50 opacity-50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
           <ShieldAlert size={180} />
        </div>
        <div className="relative z-10 flex items-center space-x-6">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-200">
            <Sparkles size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">Bem-vindo, André</h1>
            <p className="text-gray-500 font-medium">Você tem <span className="text-blue-600 font-bold">{stats.activeNafs} NAF's</span> para processar.</p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end relative z-10">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-1.5">Sessão Segura</span>
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Master Admin</span>
          </div>
        </div>
      </div>

      {/* Salmo da Bíblia (Compactado) */}
      <div className="animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-5 rounded-3xl border border-blue-100/50 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 p-3 opacity-10 text-blue-600">
            <Quote size={32} />
          </div>
          <div className="absolute bottom-0 right-0 p-3 opacity-10 text-blue-600 rotate-180">
            <Quote size={32} />
          </div>
          
          <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-50 mb-3">
             <Book size={18} className="text-blue-600" />
          </div>
          
          <div className="max-w-xl">
            <p className="text-gray-600 font-medium italic text-sm leading-relaxed mb-2">
              "{randomPsalm.text}"
            </p>
            <div className="inline-flex items-center space-x-2">
               <div className="h-[1px] w-3 bg-blue-200"></div>
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">
                 {randomPsalm.ref}
               </span>
               <div className="h-[1px] w-3 bg-blue-200"></div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
           <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">Palavra de Fé • Caderno de Protocolo</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total de NAFs" value={stats.totalNafs} icon={FileText} colorClass="bg-blue-50 text-blue-600" />
        <DashboardCard title="NAFs Pendentes" value={stats.activeNafs} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
        <DashboardCard title="Baixas de Hoje" value={stats.baixasToday} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" />
        <DashboardCard title="Fornecedores" value={stats.fornecedores} icon={Users} colorClass="bg-purple-50 text-purple-600" />
      </div>

      {/* Alertas de Validade */}
      <div className="pt-4">
        <div className="flex items-center space-x-2 mb-6 text-gray-800">
          <ShieldAlert size={18} className="text-red-500" />
          <h2 className="text-sm font-black uppercase tracking-widest">Alertas de Validade</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3 transition-all ${stats.expiredMeds > 0 ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
             <div className={`p-4 rounded-full ${stats.expiredMeds > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                <FileText size={32} />
             </div>
             <div>
                <h3 className={`text-3xl font-black ${stats.expiredMeds > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.expiredMeds}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Já Vencidos</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
             <div className="p-4 rounded-full bg-amber-500 text-white">
                <Clock size={32} />
             </div>
             <div>
                <h3 className="text-3xl font-black text-amber-600">{stats.nearExpiry30Meds}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vencem em 30 Dias</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
             <div className="p-4 rounded-full bg-gray-100 text-gray-400">
                <FileText size={32} />
             </div>
             <div>
                <h3 className="text-3xl font-black text-gray-400">{stats.nearExpiry60Meds}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vencem em 60 Dias</p>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Card: Oldest NAF */}
      {oldestNaf && (
        <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <History size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">NAF mais antiga pendente</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-black text-gray-800 tracking-tighter">
                  {oldestNaf.numero_naf} <span className="text-gray-300">/</span> {oldestNaf.numero_subnaf}
                </h3>
                <span className="text-xs font-bold text-gray-400 truncate max-w-[200px]">
                  {oldestNaf.fornecedor?.razao_social}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Dias em aberto</p>
              <p className="text-xl font-black text-red-600 leading-none">
                {getDaysWaiting(oldestNaf.data_entrada)} <span className="text-[10px] uppercase font-bold text-gray-300">dias</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
