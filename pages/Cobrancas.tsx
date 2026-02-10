
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatDate, formatCurrency, getLocalDateString } from '../utils';
import { Search, Loader2, CalendarClock, CheckCircle, FileDown, Calendar, AlertTriangle, X, Clock, CheckCircle2 } from 'lucide-react';
import Pagination from '../Pagination';

declare var html2pdf: any;

const Cobrancas: React.FC = () => {
  const [nafs, setNafs] = useState<NAF[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedNaf, setSelectedNaf] = useState<NAF | null>(null);
  const [newCobrancaDate, setNewCobrancaDate] = useState(getLocalDateString());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const calculateDaysStuck = (dataEntrada: string, dataCobranca?: string | null): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const refDate = new Date((dataCobranca || dataEntrada) + 'T00:00:00');
    return Math.floor((today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const fetchAllNafs = useCallback(async () => {
    setLoading(true);
    try {
      // Buscamos TODOS os registros (sem filtro de data_baixa) para permitir gestão global
      let query = supabase
        .from('nafs')
        .select('*, fornecedor:fornecedores(razao_social)')
        .order('data_entrada', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Filtro de busca textual no lado do cliente
      const filtered = (data || []).filter(n => {
        const matchesSearch = searchTerm 
          ? n.numero_naf.includes(searchTerm) || n.fornecedor?.razao_social.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        
        return matchesSearch;
      });

      setNafs(filtered);
    } catch (err) {
      console.error('Erro ao buscar cobranças:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAllNafs();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchAllNafs]);

  const handleMarkAsCobrado = async (naf: NAF) => {
    const today = getLocalDateString();
    try {
      const { error } = await supabase
        .from('nafs')
        .update({ data_cobranca: today })
        .eq('id', naf.id);

      if (error) throw error;
      fetchAllNafs();
    } catch (err) {
      alert('Erro ao atualizar cobrança.');
    }
  };

  const openDateModal = (naf: NAF) => {
    setSelectedNaf(naf);
    setNewCobrancaDate(naf.data_cobranca || getLocalDateString());
    setIsDateModalOpen(true);
  };

  const handleUpdateDate = async () => {
    if (!selectedNaf) return;
    try {
      const { error } = await supabase
        .from('nafs')
        .update({ data_cobranca: newCobrancaDate })
        .eq('id', selectedNaf.id);

      if (error) throw error;
      setIsDateModalOpen(false);
      fetchAllNafs();
    } catch (err) {
      alert('Erro ao atualizar data.');
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('report-cobrancas');
    if (!element) return;
    setIsGeneratingPDF(true);
    const filename = `Relatorio_Auditoria_Cobrancas_${getLocalDateString()}.pdf`;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save().then(() => setIsGeneratingPDF(false));
  };

  const totalPages = Math.ceil(nafs.length / itemsPerPage);
  const currentItems = nafs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Lista filtrada para o relatório de auditoria (apenas as PENDENTES >= 10 dias)
  const reportItems = nafs.filter(n => !n.data_baixa && calculateDaysStuck(n.data_entrada, n.data_cobranca) >= 10);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Controle de Cobrança</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestão global de protocolos e monitoramento de estagnação</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none">Alvos de Auditoria (≥10d)</span>
            <span className="text-lg font-black text-red-600 leading-none">{reportItems.length}</span>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={reportItems.length === 0 || isGeneratingPDF}
            className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-gray-900/10 active:scale-95 text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
            <span>Gerar Relatório</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por NAF ou Fornecedor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-black text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-4">Status / Dias</th>
                <th className="px-8 py-4">Situação</th>
                <th className="px-8 py-4">NAF / SUB</th>
                <th className="px-8 py-4">Fornecedor</th>
                <th className="px-8 py-4">Última Cobrança</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : nafs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-gray-400 uppercase text-[10px] font-bold">Nenhum protocolo localizado.</td>
                </tr>
              ) : (
                currentItems.map((n) => {
                  const days = calculateDaysStuck(n.data_entrada, n.data_cobranca);
                  const isBaixada = !!n.data_baixa;
                  
                  let statusColor = 'text-blue-600';
                  let dotColor = 'bg-blue-400';
                  let statusLabel = `${days} Dias`;
                  
                  const refDateFormatted = formatDate(n.data_cobranca || n.data_entrada);
                  const tooltipText = n.data_cobranca 
                    ? `Contagem baseada na última cobrança: ${refDateFormatted}` 
                    : `Contagem baseada na data de entrada: ${refDateFormatted}`;

                  if (isBaixada) {
                    statusColor = 'text-gray-400';
                    dotColor = 'bg-gray-300';
                    statusLabel = 'Concluída';
                  } else if (days >= 20) {
                    statusColor = 'text-red-600';
                    dotColor = 'bg-red-500 animate-pulse';
                    statusLabel = `${days} Dias (Crítico)`;
                  } else if (days >= 10) {
                    statusColor = 'text-amber-600';
                    dotColor = 'bg-amber-500';
                    statusLabel = `${days} Dias (Atraso)`;
                  } else {
                    statusColor = 'text-emerald-600';
                    dotColor = 'bg-emerald-500';
                    statusLabel = `${days} Dias (Em Dia)`;
                  }

                  return (
                    <tr key={n.id} className={`hover:bg-gray-50/50 transition-colors ${!isBaixada && days >= 10 ? 'bg-amber-50/10' : ''} ${isBaixada ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                      <td className="px-8 py-4">
                        <div 
                          className="flex items-center space-x-2 cursor-help" 
                          title={!isBaixada ? tooltipText : `Finalizada em ${formatDate(n.data_baixa)}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                          <span className={`font-black uppercase tracking-tighter ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        {isBaixada ? (
                          <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} className="mr-1" /> Baixada
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} className="mr-1" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4 font-black text-gray-900 tracking-tighter">{n.numero_naf} / {n.numero_subnaf}</td>
                      <td className="px-8 py-4 text-gray-800 uppercase tracking-tight font-black">{n.fornecedor?.razao_social}</td>
                      <td className="px-8 py-4">
                        {n.data_cobranca ? (
                          <span className="text-blue-600 font-black">{formatDate(n.data_cobranca)}</span>
                        ) : (
                          <span className="text-gray-300 font-bold uppercase text-[10px]">Nunca Cobrado</span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleMarkAsCobrado(n)}
                            disabled={isBaixada}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${isBaixada ? 'text-gray-200 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title="Registrar cobrança realizada hoje"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => openDateModal(n)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Retroceder ou alterar data de cobrança manualmente"
                          >
                            <Calendar size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Exibindo <span className="text-blue-600">{currentItems.length}</span> de <span className="text-blue-600">{nafs.length}</span> registros totais
          </p>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            isLoading={loading}
          />
        </div>
      </div>

      {/* Container Oculto para o Relatório PDF (Apenas alvos reais de cobrança) */}
      <div className="hidden">
        <div id="report-cobrancas" className="p-10 bg-white text-black font-sans">
          <div className="text-center mb-10 border-b-4 border-gray-900 pb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Relatório de Auditoria de Cobranças (≥ 10 dias)</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-2">Documento de Monitoramento Operacional • Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-[10px] font-black uppercase border border-gray-200">NAF / SUB</th>
                <th className="p-3 text-[10px] font-black uppercase border border-gray-200">Fornecedor</th>
                <th className="p-3 text-[10px] font-black uppercase border border-gray-200">Entrada</th>
                <th className="p-3 text-[10px] font-black uppercase border border-gray-200">Última Cobrança</th>
                <th className="p-3 text-[10px] font-black uppercase border border-gray-200 text-center">Dias Parado</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {reportItems.map(n => (
                <tr key={n.id}>
                  <td className="p-3 border border-gray-200 font-black">{n.numero_naf} / {n.numero_subnaf}</td>
                  <td className="p-3 border border-gray-200 uppercase font-bold">{n.fornecedor?.razao_social}</td>
                  <td className="p-3 border border-gray-200">{formatDate(n.data_entrada)}</td>
                  <td className="p-3 border border-gray-200">{n.data_cobranca ? formatDate(n.data_cobranca) : '-'}</td>
                  <td className="p-3 border border-gray-200 text-center font-black">{calculateDaysStuck(n.data_entrada, n.data_cobranca)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 text-[8px] font-black text-gray-300 uppercase tracking-widest flex justify-between">
            <span>Sistema Caderno de Protocolo • André Luz</span>
            <span>Autenticação: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Modal Alterar Data */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsDateModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <CalendarClock className="text-blue-600" size={24} />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Registro de Data</h3>
              </div>
              <button onClick={() => setIsDateModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">NAF Selecionada</p>
                <p className="font-black text-blue-900 text-sm">{selectedNaf?.numero_naf} / {selectedNaf?.numero_subnaf}</p>
                {selectedNaf?.data_baixa && (
                  <p className="text-[8px] font-black text-emerald-600 uppercase mt-1 italic">Protocolo Baixado em {formatDate(selectedNaf.data_baixa)}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Data da Cobrança</label>
                <input 
                  type="date" 
                  value={newCobrancaDate}
                  onChange={(e) => setNewCobrancaDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:outline-none text-black font-bold text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => setIsDateModalOpen(false)}
                  className="flex-1 py-3 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleUpdateDate}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Gravar Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cobrancas;
