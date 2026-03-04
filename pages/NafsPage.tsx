
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Plus, FileText, FileWarning, Filter, ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { NAF } from '../types';
import { nafService } from '../services/nafService';
import NafFormModal from '../components/Nafs/NafFormModal';
import NafRow from '../components/Nafs/NafRow';

const ITEMS_PER_PAGE = 6;

const NafsPage: React.FC = () => {
  const [nafs, setNafs] = useState<NAF[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNaf, setSelectedNaf] = useState<NAF | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const buscarNafs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await nafService.listPaginated(currentPage, ITEMS_PER_PAGE, debouncedSearch);
      setNafs(result.data);
      setTotalItems(result.count);
    } catch (error) {
      console.error("Erro ao carregar NAFs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    buscarNafs();
  }, [buscarNafs, refreshKey]);

  const totalPages = useMemo(() => Math.ceil(totalItems / ITEMS_PER_PAGE), [totalItems]);

  const handleEdit = useCallback((naf: NAF) => {
    setSelectedNaf(naf);
    setIsModalOpen(true);
  }, []);

  // Implementação do estornarBaixa conforme solicitado
  const estornarBaixa = useCallback(async (nafId: string) => {
    const result = await nafService.revertWithdrawal(nafId);
    if (result.success) {
      buscarNafs();
    }
  }, [buscarNafs]);

  const handleNew = useCallback(() => {
    setSelectedNaf(null);
    setIsModalOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const paginationRange = useMemo(() => {
    const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    return { startRecord, endRecord };
  }, [totalItems, currentPage]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#02416D] tracking-tight">Protocolos NAF</h2>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <BookOpen size={16} className="text-[#AEDD2B]" />
            Gerencie sua rede de ordens de fornecimento.
          </p>
        </div>

        <button 
          onClick={handleNew}
          className="flex items-center gap-3 bg-[#AEDD2B] text-[#02416D] px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#AEDD2B]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={24} />
          NOVA NAF
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por Número da NAF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-2xl transition-all outline-none font-medium text-gray-700"
          />
        </div>
        <div className="flex items-center gap-3 bg-[#0A5483]/5 px-6 py-4 rounded-2xl text-[#0A5483] font-bold text-sm">
          <Filter size={18} />
          {totalItems} Protocolos
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-[#0A5483] animate-spin" />
              <p className="text-[#0A5483] font-bold text-sm uppercase tracking-widest">Acessando Caderno...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A5483] text-white">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Entrada / Saída</th>
                <th className="px-6 py-6 text-xs font-black uppercase tracking-widest">NAF / SUB</th>
                <th className="px-6 py-6 text-xs font-black uppercase tracking-widest">Fornecedor</th>
                <th className="px-6 py-6 text-xs font-black uppercase tracking-widest">Valor</th>
                <th className="px-6 py-6 text-xs font-black uppercase tracking-widest">Situação</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout" initial={false}>
                {nafs.length > 0 ? (
                  nafs.map((naf) => (
                    <NafRow 
                      key={naf.id}
                      naf={naf}
                      onEdit={handleEdit}
                      onRevert={estornarBaixa}
                    />
                  ))
                ) : !isLoading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FileWarning size={64} className="mb-4 text-[#02416D] opacity-20" />
                        <h4 className="text-xl font-bold text-[#02416D]">Caderno sem registros</h4>
                        <p className="text-sm text-[#02416D] opacity-60">Inicie um novo protocolo clicando em "NOVA NAF".</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="bg-white px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-gray-500">
              Protocolos <span className="text-[#02416D] font-bold">{paginationRange.startRecord}–{paginationRange.endRecord}</span> de <span className="text-[#02416D] font-bold">{totalItems}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 font-bold text-xs ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-[#02416D] hover:bg-[#F8F8EC]'
                }`}
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">ANTERIOR</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#AEDD2B] text-[#02416D] shadow-md shadow-[#AEDD2B]/20'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-[#02416D]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 font-bold text-xs ${
                  currentPage === totalPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-[#02416D] hover:bg-[#F8F8EC]'
                }`}
              >
                <span className="hidden sm:inline">PRÓXIMO</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <NafFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nafToEdit={selectedNaf}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
};

export default NafsPage;
