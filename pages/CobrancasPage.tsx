
import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { nafService } from '../services/nafService';
import { NAF } from '../types';
import { formatDate } from '../utils/dateUtils';
import BillingReportPDF from '../components/Relatorios/BillingReportPDF';

const CobrancasPage: React.FC = () => {
  const [nafs, setNafs] = useState<NAF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterOnlyApt, setFilterOnlyApt] = useState(false);
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNaf, setSelectedNaf] = useState<NAF | null>(null);
  const [editDate, setEditDate] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await nafService.listForBilling(searchTerm);
      setNafs(data);
    } catch (error) {
      console.error("Erro ao carregar cobranças:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegisterBilling = async (id: string) => {
    const res = await nafService.registerBilling(id);
    if (res.success) {
      loadData();
    } else {
      alert(res.message);
    }
  };

  const handleClearBilling = async (id: string) => {
    if (!confirm("Deseja realmente remover a data da última cobrança?")) return;
    const res = await nafService.clearBilling(id);
    if (res.success) {
      loadData();
    } else {
      alert(res.message);
    }
  };

  const handleOpenEditModal = (naf: NAF) => {
    setSelectedNaf(naf);
    setEditDate(naf.data_cobranca ? naf.data_cobranca.split('T')[0] : new Date().toISOString().split('T')[0]);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedNaf) return;
    const res = await nafService.registerBilling(selectedNaf.id, editDate);
    if (res.success) {
      setIsEditModalOpen(false);
      loadData();
    } else {
      alert(res.message);
    }
  };

  const generateReport = async () => {
    const aptNafs = nafs.filter(n => n.pode_cobrar);
    if (aptNafs.length === 0) {
      alert("Não há NAFs aptas para cobrança no momento.");
      return;
    }

    setIsGenerating(true);
    try {
      const doc = <BillingReportPDF nafs={aptNafs} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredNafs = nafs.filter(naf => {
    const matchesSupplier = naf.suppliers?.name.toLowerCase().includes(filterSupplier.toLowerCase());
    const matchesApt = filterOnlyApt ? naf.pode_cobrar : true;
    
    return matchesSupplier && matchesApt;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#02416D] tracking-tight">Cobrança</h2>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <CreditCard size={16} className="text-[#AEDD2B]" />
            Gerencie o controle de cobranças e prazos dos protocolos.
          </p>
        </div>
        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="bg-[#0A5483] text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-[#02416D] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
          GERAR RELATÓRIO DE COBRANÇA
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por NAF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-xl transition-all outline-none font-bold text-[#02416D]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Filtrar por Fornecedor..."
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-xl transition-all outline-none font-bold text-[#02416D]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={filterOnlyApt}
              onChange={(e) => setFilterOnlyApt(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AEDD2B]"></div>
            <span className="ml-3 text-sm font-black text-[#02416D] uppercase tracking-wider">Apenas NAFs aptas para cobrança (+10 dias)</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F8EC] border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-[#02416D] uppercase tracking-widest">NAF / Sub</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#02416D] uppercase tracking-widest">Fornecedor</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#02416D] uppercase tracking-widest">Entrada</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#02416D] uppercase tracking-widest">Situação</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#02416D] uppercase tracking-widest">Última Cobrança</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#02416D] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#0A5483]" size={40} />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando dados...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredNafs.length > 0 ? (
                filteredNafs.map((naf) => {
                  const apta = naf.pode_cobrar;
                  
                  return (
                    <tr key={naf.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-[#02416D] text-lg">{naf.naf_number}</span>
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Sub: {naf.subnaf_number || '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-gray-700">{naf.suppliers?.name || '---'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-gray-500">{formatDate(naf.entry_date)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                          Na Pasta
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-[#02416D]">{formatDate(naf.data_cobranca)}</span>
                          {apta && (
                            <div className="flex items-center gap-1 text-red-500">
                              <AlertCircle size={12} />
                              <span className="text-[10px] font-black uppercase tracking-tighter">{naf.dias_parados} dias em aberto</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleRegisterBilling(naf.id)}
                            title="Registrar Cobrança Hoje"
                            className="p-2 rounded-xl transition-all bg-[#AEDD2B]/10 text-[#02416D] hover:bg-[#AEDD2B] shadow-sm"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(naf)}
                            title="Editar Data de Cobrança"
                            className="p-2 bg-gray-100 text-gray-500 hover:bg-[#0A5483] hover:text-white rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleClearBilling(naf.id)}
                            title="Remover Data de Cobrança"
                            className="p-2 bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Search size={48} className="text-gray-400" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum protocolo encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-[#02416D]/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[#02416D] tracking-tight">Editar Cobrança</h3>
                  <p className="text-gray-500 font-medium text-sm mt-1">Ajuste a data da última cobrança manualmente.</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#02416D] uppercase tracking-widest mb-2 ml-1">Data da Cobrança</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-2xl transition-all outline-none font-bold text-[#02416D]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-[#02416D] bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-4 rounded-2xl font-black text-white bg-[#0A5483] hover:bg-[#02416D] transition-all shadow-lg shadow-[#0A5483]/20"
                  >
                    SALVAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CobrancasPage;
