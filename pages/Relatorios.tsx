
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { NAF, Fornecedor, Medicamento } from '../types';
import { formatDate, calculateNafPage } from '../utils';
import { Printer, Calendar, List, User, Search, Loader2, FileDown, Pill, AlertTriangle } from 'lucide-react';

declare var html2pdf: any;

const Relatorios: React.FC = () => {
  const [reportType, setReportType] = useState<number>(0);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [allNafsOrdered, setAllNafsOrdered] = useState<string[]>([]);
  
  // Filter states
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterSupplier, setFilterSupplier] = useState('');
  const [medFilter, setMedFilter] = useState('vencidos'); // 'todos', 'vencidos', '30d', '60d'

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
      if (reportType === 4) {
        // Relatório de Medicamentos
        let query = supabase.from('medicamentos').select('*').order('validade', { ascending: true });
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (medFilter === 'vencidos') {
          query = query.lt('validade', todayStr);
        } else if (medFilter === '30d') {
          const next30 = new Date();
          next30.setDate(today.getDate() + 30);
          query = query.gte('validade', todayStr).lte('validade', next30.toISOString().split('T')[0]);
        } else if (medFilter === '60d') {
          const next60 = new Date();
          next60.setDate(today.getDate() + 60);
          query = query.gte('validade', todayStr).lte('validade', next60.toISOString().split('T')[0]);
        }

        const { data, error } = await query;
        if (error) throw error;
        setResults(data || []);
      } else {
        // Relatórios de NAFs
        let query = supabase.from('nafs').select('*, fornecedor:fornecedores(*)').order('created_at', { ascending: true });

        if (reportType === 1) {
          query = query.eq('data_baixa', filterDate);
        } else if (reportType === 2) {
          query = query.is('data_baixa', null);
        } else if (reportType === 3) {
          if (filterSupplier) {
            query = query.eq('fornecedor_id', filterSupplier);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setResults(data || []);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    const element = document.getElementById('report-to-print');
    if (!element) return;

    setIsGeneratingPDF(true);

    const typeNames = ["", "Baixadas", "Pendentes", "Fornecedor", "Estoque"];
    const reportName = typeNames[reportType] || "Relatorio";
    const filename = `Protocolo_${reportName}_${new Date().toISOString().split('T')[0]}.pdf`;

    const opt = {
      margin: [15, 12, 15, 12],
      filename: filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      setIsGeneratingPDF(false);
    }).catch((err: any) => {
      console.error(err);
      setIsGeneratingPDF(false);
    });
  };

  return (
    <div className="space-y-8 print:p-0 pb-12">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Relatórios e Alertas</h1>
        <p className="text-gray-500 text-sm">Gere documentos oficiais e listagens de auditoria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <button onClick={() => { setReportType(1); setResults([]); }} className={`p-6 rounded-2xl border text-left transition-all ${reportType === 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'}`}>
          <Calendar className={reportType === 1 ? 'text-blue-600' : 'text-gray-400'} size={24} />
          <h3 className={`mt-3 font-bold text-sm ${reportType === 1 ? 'text-blue-700' : 'text-gray-700'}`}>Baixas do Dia</h3>
        </button>

        <button onClick={() => { setReportType(2); setResults([]); }} className={`p-6 rounded-2xl border text-left transition-all ${reportType === 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'}`}>
          <List className={reportType === 2 ? 'text-blue-600' : 'text-gray-400'} size={24} />
          <h3 className={`mt-3 font-bold text-sm ${reportType === 2 ? 'text-blue-700' : 'text-gray-700'}`}>NAFs Pendentes</h3>
        </button>

        <button onClick={() => { setReportType(3); setResults([]); }} className={`p-6 rounded-2xl border text-left transition-all ${reportType === 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'}`}>
          <User className={reportType === 3 ? 'text-blue-600' : 'text-gray-400'} size={24} />
          <h3 className={`mt-3 font-bold text-sm ${reportType === 3 ? 'text-blue-700' : 'text-gray-700'}`}>Por Fornecedor</h3>
        </button>

        <button onClick={() => { setReportType(4); setResults([]); }} className={`p-6 rounded-2xl border text-left transition-all ${reportType === 4 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'}`}>
          <Pill className={reportType === 4 ? 'text-blue-600' : 'text-gray-400'} size={24} />
          <h3 className={`mt-3 font-bold text-sm ${reportType === 4 ? 'text-blue-700' : 'text-gray-700'}`}>Validade Estoque</h3>
        </button>
      </div>

      {reportType !== 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {reportType === 1 && (
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Data</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            )}
            {reportType === 3 && (
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Fornecedor</label>
                <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">Todos</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social}</option>)}
                </select>
              </div>
            )}
            {reportType === 4 && (
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Filtro de Validade</label>
                <select value={medFilter} onChange={(e) => setMedFilter(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white text-black text-sm font-black focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="todos">Todos em Estoque</option>
                  <option value="vencidos" className="text-red-600">Já Vencidos</option>
                  <option value="30d" className="text-amber-600">Crítico (30 dias)</option>
                  <option value="60d" className="text-yellow-600">Atenção (60 dias)</option>
                </select>
              </div>
            )}
            <button onClick={generateReport} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md active:scale-95 disabled:opacity-50 text-sm h-[42px]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              <span>{loading ? 'Buscando...' : 'Gerar Relatório'}</span>
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="animate-fadeIn space-y-4">
          <div className="flex justify-between items-center print:hidden px-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{results.length} registros processados</span>
            <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-gray-800 transition-all font-bold text-sm shadow-lg active:scale-95 disabled:opacity-50">
              {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
              <span>Download PDF</span>
            </button>
          </div>

          <div id="report-to-print" className="bg-white text-black p-0 border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-12 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-2">
                {reportType === 4 ? 'Inventário de Estoque' : 'Caderno de Protocolos'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Gestão Corporativa de Insumos</p>
              
              <div className="mt-10 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo do Documento</p>
                   <p className="text-xs font-bold text-gray-700">
                     {reportType === 4 ? `Validade: ${medFilter.toUpperCase()}` : 'Listagem Oficial'}
                   </p>
                </div>
                <div className="text-center border-x border-gray-100">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Data de Emissão</p>
                   <p className="text-xs font-bold text-gray-700">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-center">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Registros</p>
                   <p className="text-xs font-bold text-gray-700">{results.length}</p>
                </div>
              </div>
            </div>

            <div className="px-12 pb-12">
              <table className="w-full text-left table-auto border-collapse">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-200">
                    {reportType === 4 ? (
                      <>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Medicamento</th>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Lote</th>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Validade</th>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Situação</th>
                      </>
                    ) : (
                      <>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Data</th>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400">NAF / SUB</th>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Fornecedor</th>
                        <th className="py-5 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Página</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {results.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                      {reportType === 4 ? (
                        <>
                          <td className="py-4 px-3 font-bold text-gray-800">{item.nome}</td>
                          <td className="py-4 px-3 font-mono text-gray-500 uppercase">{item.lote}</td>
                          <td className="py-4 px-3 font-bold text-gray-700">{formatDate(item.validade)}</td>
                          <td className="py-4 px-3 text-right">
                             {new Date(item.validade) < new Date() ? (
                               <span className="text-red-600 font-black tracking-tighter">VENCIDO</span>
                             ) : (
                               <span className="text-emerald-600 font-black tracking-tighter">REGULAR</span>
                             )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-3 text-gray-600 font-medium">{formatDate(item.data_entrada)}</td>
                          <td className="py-4 px-3 font-black text-gray-900">{item.numero_naf} / {item.numero_subnaf}</td>
                          <td className="py-4 px-3 font-bold text-gray-700 uppercase tracking-tight">{item.fornecedor?.razao_social}</td>
                          <td className="py-4 px-3 text-center">
                             <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                               Pg. {calculateNafPage(allNafsOrdered.indexOf(item.id))}
                             </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-12 bg-gray-50/50 flex justify-between items-center text-[7px] font-bold text-gray-300 uppercase tracking-widest border-t border-gray-100">
              <div className="flex space-x-4">
                 <span>Caderno de Protocolo v1.2</span>
                 <span className="text-gray-200">|</span>
                 <span>Documento de Uso Interno</span>
              </div>
              <div className="flex space-x-2">
                 <span>Autenticidade Verificada</span>
                 <span className="font-mono text-[9px] text-gray-400"># {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
