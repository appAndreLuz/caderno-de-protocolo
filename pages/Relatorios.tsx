
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Fornecedor } from '../types';
import { formatDate, calculateNafPage, formatCurrency } from '../utils';
import { 
  User, 
  Loader2, 
  FileDown, 
  AlertCircle,
  Clock,
  Truck,
  FileCheck2,
  FileX2,
  ChevronRight,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

declare var html2pdf: any;

const ReportCard = ({ category, isSelected, onClick }: any) => {
  const Icon = category.icon;
  return (
    <button 
      onClick={onClick}
      className={`relative group p-6 rounded-[2.5rem] border-2 transition-all duration-500 text-left flex flex-col justify-between h-52 overflow-hidden ${
        isSelected 
          ? `border-blue-600 ${category.bg} shadow-2xl shadow-blue-500/10 -translate-y-2` 
          : 'border-white bg-white hover:border-blue-100 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Background Decorator */}
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 ${isSelected ? 'opacity-10 scale-110' : ''}`}>
        <Icon size={140} />
      </div>

      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : `${category.bg} ${category.color} group-hover:scale-110`
        }`}>
          <Icon size={28} strokeWidth={isSelected ? 2.5 : 2} />
        </div>
        
        <div className="mt-6">
          <h3 className={`font-black text-[12px] uppercase tracking-widest leading-none ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
            {category.label}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-3 tracking-widest opacity-80 leading-tight">
            {category.description}
          </p>
        </div>
      </div>

      <div className={`relative z-10 flex items-center justify-between mt-auto transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 translate-x-4'}`}>
        <div className="flex items-center space-x-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
           <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Protocolo Ativo</span>
        </div>
        <ArrowRight size={16} className="text-blue-600" />
      </div>
    </button>
  );
};

const Relatorios: React.FC = () => {
  const [reportType, setReportType] = useState<number>(0);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [allNafsOrdered, setAllNafsOrdered] = useState<string[]>([]);
  
  // Filters
  const [filterSupplier, setFilterSupplier] = useState('');

  const reportCategories = [
    { id: 1, label: "Fornecedor", description: "Histórico consolidado por parceiro", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, label: "Finalizados", description: "Protocolos com baixa concluída", icon: FileCheck2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 3, label: "Pendentes", description: "Itens aguardando processamento", icon: FileX2, color: "text-amber-600", bg: "bg-amber-50" },
    { id: 4, label: "Críticos 30d", description: "Vencimentos de estoque imediatos", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { id: 5, label: "Monitoramento", description: "Atenção a vencimentos 31-60 dias", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { id: 6, label: "Estagnação", description: "Parados em pasta há 10+ dias", icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase.from('fornecedores').select('*').order('razao_social');
      setFornecedores(data || []);
    };
    fetchSuppliers();
    
    const fetchOrder = async () => {
      const { data } = await supabase.from('nafs').select('id').order('created_at', { ascending: true });
      if (data) setAllNafsOrdered(data.map(n => n.id));
    };
    fetchOrder();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const today = new Date();
      if (reportType === 1) { 
        let query = supabase.from('nafs').select('*, fornecedor:fornecedores(*)').order('created_at', { ascending: true });
        if (filterSupplier) query = query.eq('fornecedor_id', filterSupplier);
        const { data } = await query;
        setResults(data || []);
      } 
      else if (reportType === 2) { 
        const { data } = await supabase.from('nafs').select('*, fornecedor:fornecedores(*)').not('data_baixa', 'is', null).order('data_baixa', { ascending: false });
        setResults(data || []);
      } 
      else if (reportType === 3) { 
        const { data } = await supabase.from('nafs').select('*, fornecedor:fornecedores(*)').is('data_baixa', null).order('data_entrada', { ascending: true });
        setResults(data || []);
      } 
      else if (reportType === 4) { 
        const limitDate = new Date();
        limitDate.setDate(today.getDate() + 30);
        const { data } = await supabase.from('medicamentos').select('*').lte('validade', limitDate.toISOString().split('T')[0]).order('validade', { ascending: true });
        setResults(data || []);
      } 
      else if (reportType === 5) { 
        const start = new Date();
        start.setDate(today.getDate() + 31);
        const end = new Date();
        end.setDate(today.getDate() + 60);
        const { data } = await supabase.from('medicamentos').select('*').gte('validade', start.toISOString().split('T')[0]).lte('validade', end.toISOString().split('T')[0]).order('validade', { ascending: true });
        setResults(data || []);
      } 
      else if (reportType === 6) { 
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(today.getDate() - 10);
        const { data } = await supabase.from('nafs').select('*, fornecedor:fornecedores(*)').is('data_baixa', null).lte('data_entrada', tenDaysAgo.toISOString().split('T')[0]).order('data_entrada', { ascending: true });
        setResults(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    const element = document.getElementById('report-to-print');
    if (!element) return;
    setIsGeneratingPDF(true);
    const filename = `Protocolo_AndréLuz_${reportCategories.find(c => c.id === reportType)?.label.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    const opt = {
      margin: [0, 0, 0, 0],
      filename: filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save().then(() => setIsGeneratingPDF(false));
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-24 max-w-7xl mx-auto">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-3 rounded-2xl text-white shadow-xl shadow-blue-500/20">
              <BarChart3 size={24} />
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-amber-400 fill-amber-400" />
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Auditoria de Dados</h1>
            </div>
          </div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.4em] ml-1">Relatórios Inteligentes para Tomada de Decisão</p>
        </div>

        {results.length > 0 && (
           <button 
             onClick={handleGeneratePDF} 
             disabled={isGeneratingPDF} 
             className="bg-gray-900 text-white px-8 py-4 rounded-2xl flex items-center space-x-4 hover:bg-black transition-all font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-50"
           >
             {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
             <span>Exportar Documento</span>
           </button>
        )}
      </div>

      {/* 2. Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {reportCategories.map((type) => (
          <ReportCard 
            key={type.id}
            category={type}
            isSelected={reportType === type.id}
            onClick={() => { setReportType(type.id); setResults([]); }} 
          />
        ))}
      </div>

      {/* 3. Filter Controls */}
      {reportType !== 0 && (
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] animate-scaleIn relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-blue-600 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             <Layers size={150} />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-end relative z-10">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3 ml-2">
                <CalendarDays size={14} className="text-blue-600" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Configuração de Auditoria</p>
              </div>
              
              {reportType === 1 ? (
                <div className="relative">
                  <select 
                    value={filterSupplier} 
                    onChange={(e) => setFilterSupplier(e.target.value)} 
                    className="w-full pl-6 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-gray-900 text-xs font-black uppercase focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600/20 transition-all outline-none tracking-widest appearance-none cursor-pointer"
                  >
                    <option value="">Todos os Parceiros de Negócio</option>
                    {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    <ChevronRight size={20} className="rotate-90" />
                  </div>
                </div>
              ) : (
                <div className="px-8 py-5 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[12px] font-black text-blue-900 uppercase tracking-tight">Processamento Dinâmico Ativo</span>
                      <span className="text-[9px] font-bold text-blue-500 uppercase mt-1 tracking-widest">Parâmetros: {reportCategories.find(c => c.id === reportType)?.label}</span>
                   </div>
                   <CheckCircle2 size={24} className="text-blue-600 opacity-30" />
                </div>
              )}
            </div>
            
            <button 
              onClick={generateReport} 
              disabled={loading}
              className="w-full lg:w-auto bg-blue-600 text-white px-16 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center space-x-4 shadow-2xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 min-w-[240px]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{loading ? 'Sincronizando...' : 'Gerar Relatório'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Results / PDF Preview */}
      {results.length > 0 && (
        <div className="animate-fadeIn space-y-8 px-4">
          <div className="flex items-center space-x-2 text-emerald-600">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sincronização concluída • {results.length} entradas</span>
          </div>

          {/* Documento Renderizado na Tela (Apenas para visualização pré-PDF) */}
          <div id="report-to-print" className="bg-white text-black p-0 overflow-hidden font-sans border-0 shadow-2xl w-full lg:w-[210mm] min-h-[297mm] mx-auto relative">
            
            {/* Header Corporativo Refinado */}
            <div className="pt-24 px-20 pb-16 text-center bg-gray-50/30">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="bg-gray-900 p-2 rounded-lg text-white">
                  <Layers size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Almoxarifado Central</span>
              </div>
              
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                Documento de Auditoria
              </h1>
              <div className="flex items-center justify-center space-x-4">
                <span className="h-[2px] w-12 bg-blue-600 rounded-full"></span>
                <p className="text-blue-600 text-[13px] font-black tracking-[0.6em] uppercase opacity-90">
                  {reportCategories.find(c => c.id === reportType)?.label}
                </p>
                <span className="h-[2px] w-12 bg-blue-600 rounded-full"></span>
              </div>
            </div>

            {/* Metadados do Documento */}
            <div className="px-20 mb-16 grid grid-cols-3 gap-8">
               <div className="text-left py-6 border-b border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Escopo da Pesquisa</p>
                  <p className="text-[13px] font-black text-gray-800 uppercase tracking-tight leading-none">
                    {reportCategories.find(c => c.id === reportType)?.label}
                  </p>
               </div>
               <div className="text-center py-6 border-b border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Data de Emissão</p>
                  <p className="text-[13px] font-black text-gray-800 tracking-tight leading-none">{new Date().toLocaleDateString('pt-BR')}</p>
               </div>
               <div className="text-right py-6 border-b border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Volume Processado</p>
                  <p className="text-[13px] font-black text-gray-800 tracking-tight leading-none">{results.length} Itens</p>
               </div>
            </div>

            {/* Tabela de Auditoria Limpa */}
            <div className="px-16 pb-32">
              <table className="w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="py-6 px-4 text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">Data Ref.</th>
                    <th className="py-6 px-4 text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">Identificador</th>
                    <th className="py-6 px-4 text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">Entidade / Item</th>
                    <th className="py-6 px-4 text-[9px] font-black text-gray-900 uppercase tracking-[0.3em] text-right">Caderno</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] leading-none">
                  {results.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 px-4 font-bold text-gray-400 tracking-widest">
                        {reportType === 4 || reportType === 5 ? formatDate(item.validade) : 
                         reportType === 2 ? formatDate(item.data_baixa) : formatDate(item.data_entrada)}
                      </td>
                      <td className="py-6 px-4 font-black text-gray-900 text-[12px] tracking-tighter">
                        {reportType === 4 || reportType === 5 ? `LT ${item.lote}` : `NAF ${item.numero_naf}/${item.numero_subnaf}`}
                      </td>
                      <td className="py-6 px-4 font-black text-blue-900 uppercase truncate max-w-[300px] tracking-tight">
                        {reportType === 4 || reportType === 5 ? item.nome : item.fornecedor?.razao_social}
                      </td>
                      <td className="py-6 px-4 text-right">
                        {reportType === 4 || reportType === 5 ? (
                          <span className="font-black text-gray-300 uppercase text-[8px] tracking-[0.2em]">Registro Físico</span>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-100"></span>
                             <span className="text-gray-400 font-black text-[10px]">FOLHA #{calculateNafPage(allNafsOrdered.indexOf(item.id))}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer de Autenticação */}
            <div className="absolute bottom-0 w-full bg-gray-900 px-20 py-16 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
               <div className="flex items-center space-x-4">
                  <div className="w-4 h-[2px] bg-blue-500"></div>
                  <span>Sistema Caderno de Protocolo • André Luz</span>
               </div>
               <div className="opacity-40 flex items-center space-x-4">
                 <span>Hash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                 <div className="w-4 h-[2px] bg-white"></div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Empty State */}
      {results.length === 0 && reportType !== 0 && !loading && (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-gray-100 shadow-sm animate-fadeIn">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <BarChart3 size={40} className="text-gray-200" />
           </div>
           <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em]">Nenhum dado capturado</p>
           <p className="text-[10px] font-black text-gray-300 uppercase mt-3 tracking-widest">Execute a consulta para popular o dossiê</p>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
