
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { NAF, Fornecedor, Medicamento } from '../types';
import { formatDate, calculateNafPage, formatCurrency } from '../utils';
import { 
  Calendar, 
  List, 
  User, 
  Search, 
  Loader2, 
  FileDown, 
  Pill, 
  BadgeCheck,
  Hash,
  AlertCircle,
  Clock,
  Truck,
  FileCheck2,
  FileX2,
  ChevronRight,
  BarChart3
} from 'lucide-react';

declare var html2pdf: any;

const ReportCard = ({ category, isSelected, onClick }: any) => {
  const Icon = category.icon;
  return (
    <button 
      onClick={onClick}
      className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-500 text-left flex flex-col justify-between h-48 overflow-hidden ${
        isSelected 
          ? `border-blue-600 ${category.bg} shadow-xl shadow-blue-500/10 -translate-y-2` 
          : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-2xl hover:-translate-y-1'
      }`}
    >
      {/* Background Decorator */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 ${isSelected ? 'opacity-10' : ''}`}>
        <Icon size={120} />
      </div>

      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 rotate-6' : `${category.bg} ${category.color} group-hover:scale-110`
        }`}>
          <Icon size={24} />
        </div>
        
        <div className="mt-4">
          <h3 className={`font-black text-[11px] uppercase tracking-widest leading-none ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
            {category.label}
          </h3>
          <p className="text-[9px] font-black text-gray-400 uppercase mt-2.5 tracking-widest opacity-70 leading-tight">
            {category.description}
          </p>
        </div>
      </div>

      <div className={`relative z-10 flex items-center justify-between mt-auto transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 translate-x-4'}`}>
        <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em]">Selecionado</span>
        <ChevronRight size={14} className="text-blue-600" />
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
    { id: 1, label: "Por Fornecedor", description: "Consolidado de movimentação", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, label: "Com Saídas", description: "Protocolos já finalizados", icon: FileCheck2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 3, label: "Sem Saídas", description: "Itens aguardando baixa", icon: FileX2, color: "text-amber-600", bg: "bg-amber-50" },
    { id: 4, label: "Críticos ≤ 30d", description: "Vencimentos imediatos", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { id: 5, label: "Monitoramento", description: "Vencimentos entre 31-60 dias", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { id: 6, label: "Atraso Entrega", description: "Protocolos parados >10 dias", icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
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
    const filename = `Relatorio_${reportCategories.find(c => c.id === reportType)?.label.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    const opt = {
      margin: [0, 0, 0, 0],
      filename: filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save().then(() => setIsGeneratingPDF(false));
  };

  return (
    <div className="space-y-10 print:p-0 pb-20">
      <div className="print:hidden">
        <div className="flex items-center space-x-3 mb-2">
           <div className="p-2 bg-blue-600 rounded-xl text-white">
              <BarChart3 size={20} />
           </div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Auditoria Master</h1>
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Painel Inteligente de Relatórios Corporativos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 print:hidden">
        {reportCategories.map((type) => (
          <ReportCard 
            key={type.id}
            category={type}
            isSelected={reportType === type.id}
            onClick={() => { setReportType(type.id); setResults([]); }} 
          />
        ))}
      </div>

      {reportType !== 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm print:hidden animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-600">
             <BarChart3 size={100} />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-end relative z-10">
            {reportType === 1 ? (
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Filtro de Fornecedor</label>
                <select 
                  value={filterSupplier} 
                  onChange={(e) => setFilterSupplier(e.target.value)} 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 text-xs font-black uppercase focus:ring-4 focus:ring-blue-600/10 transition-all outline-none tracking-widest"
                >
                  <option value="">Todos os Parceiros</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social}</option>)}
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Parâmetros de Auditoria</p>
                <div className="px-6 py-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                   Relatório Automático • Configuração Padrão André Luz
                </div>
              </div>
            )}
            
            <button 
              onClick={generateReport} 
              disabled={loading}
              className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/30 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <BarChart3 size={18} />}
              <span>{loading ? 'Sincronizando...' : 'Processar Dados'}</span>
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="animate-fadeIn space-y-6">
          <div className="flex justify-between items-center print:hidden px-4">
            <div className="flex items-center space-x-2 text-emerald-500">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Documento Consolidado pronto</span>
            </div>
            <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="bg-gray-900 text-white px-10 py-5 rounded-2xl flex items-center space-x-4 hover:bg-black transition-all font-black text-[11px] uppercase tracking-widest shadow-2xl disabled:opacity-50 active:scale-95">
              {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
              <span>Exportar PDF Corporativo</span>
            </button>
          </div>

          <div id="report-to-print" className="bg-white text-black p-0 overflow-hidden font-sans border-0 shadow-none w-[210mm] min-h-[297mm] mx-auto">
            <div className="h-3 bg-blue-600 w-full mb-16"></div>

            <div className="px-16 text-center mb-16">
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">
                CADERNO DE PROTOCOLOS
              </h1>
              <p className="text-blue-600 text-[12px] font-black tracking-[0.6em] uppercase opacity-90">
                GESTÃO CORPORATIVA DE INSUMOS
              </p>
            </div>

            <div className="px-16 mb-12 grid grid-cols-3 gap-6">
               <div className="text-left py-6 border-b-2 border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AUDITORIA</p>
                  <p className="text-[14px] font-black text-gray-800 uppercase tracking-tight leading-none">
                    {reportCategories.find(c => c.id === reportType)?.label}
                  </p>
               </div>
               <div className="text-center py-6 border-b-2 border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">EMISSÃO</p>
                  <p className="text-[14px] font-black text-gray-800 tracking-tight leading-none">{new Date().toLocaleDateString('pt-BR')}</p>
               </div>
               <div className="text-right py-6 border-b-2 border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">REGISTROS</p>
                  <p className="text-[14px] font-black text-gray-800 tracking-tight leading-none">{results.length} Itens</p>
               </div>
            </div>

            <div className="px-12 pb-24">
              <table className="w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">DATA REF</th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">NAF/LOTE</th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">FORNECEDOR/ITEM</th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">INFO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {results.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-6 px-6 font-bold text-gray-400 tracking-widest">
                        {reportType === 4 || reportType === 5 ? formatDate(item.validade) : 
                         reportType === 2 ? formatDate(item.data_baixa) : formatDate(item.data_entrada)}
                      </td>
                      <td className="py-6 px-6 font-black text-gray-900 text-[13px] tracking-tighter">
                        {reportType === 4 || reportType === 5 ? item.lote : `${item.numero_naf}/${item.numero_subnaf}`}
                      </td>
                      <td className="py-6 px-6 font-black text-blue-900 uppercase truncate max-w-[280px] tracking-tight">
                        {reportType === 4 || reportType === 5 ? item.nome : item.fornecedor?.razao_social}
                      </td>
                      <td className="py-6 px-6 text-right">
                        {reportType === 4 || reportType === 5 ? (
                          <span className="font-black text-gray-400 uppercase text-[9px] tracking-widest">ESTOQUE</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border border-gray-200/50 tracking-widest">
                            PG. {calculateNafPage(allNafsOrdered.indexOf(item.id))}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="absolute bottom-0 w-full bg-gray-50 px-16 py-12 border-t border-gray-100 flex justify-between items-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
               <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>DOCUMENTO DE AUDITORIA INTERNA • V1.5.0</span>
               </div>
               <div className="flex items-center space-x-2">
                 <span className="text-blue-900">{Math.random().toString(36).substring(7).toUpperCase()}</span>
                 <Hash size={12} className="text-blue-300" />
               </div>
            </div>
          </div>
        </div>
      )}

      {results.length === 0 && reportType !== 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 animate-fadeIn">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-200" />
           </div>
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Nenhum registro localizado</p>
           <p className="text-[9px] font-black text-gray-300 uppercase mt-2 tracking-widest">Altere os filtros ou a categoria do relatório</p>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
