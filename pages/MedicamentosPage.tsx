
import React, { useState, useMemo, useEffect, useCallback, useTransition } from 'react';
import { Search, Plus, Pill, FileWarning, Filter, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Medicine } from '../types';
import { medicineService } from '../services/medicineService';
import MedicineFormModal from '../components/Medicamentos/MedicineFormModal';
import MedicineRow from '../components/Medicamentos/MedicineRow';

const ITEMS_PER_PAGE = 8;

const MedicineSkeleton = () => (
  <>
    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
      <tr key={`skeleton-${i}`} className="animate-pulse border-b border-gray-50">
        <td className="px-8 py-6"><div className="h-5 w-20 bg-gray-100 rounded-lg" /></td>
        <td className="px-6 py-6"><div className="h-5 w-48 bg-gray-100 rounded-lg" /></td>
        <td className="px-6 py-6"><div className="h-5 w-16 bg-gray-100 rounded-lg" /></td>
        <td className="px-6 py-6"><div className="h-5 w-24 bg-gray-100 rounded-lg" /></td>
        <td className="px-6 py-6"><div className="h-8 w-32 bg-gray-100 rounded-full" /></td>
        <td className="px-8 py-6 text-right"><div className="h-10 w-24 bg-gray-100 rounded-xl ml-auto" /></td>
      </tr>
    ))}
  </>
);

const MedicamentosPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [hasExpiredItems, setHasExpiredItems] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchTerm);
        setCurrentPage(1);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [result, expiredCheck] = await Promise.all([
          medicineService.listPaginated(currentPage, ITEMS_PER_PAGE, debouncedSearch),
          medicineService.hasExpired()
        ]);
        
        if (isMounted) {
          setMedicines(result.data);
          setTotalItems(result.count);
          setHasExpiredItems(expiredCheck);
        }
      } catch (error) {
        console.error("Erro ao carregar medicamentos:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentPage, debouncedSearch, refreshKey]);

  const totalPages = useMemo(() => Math.ceil(totalItems / ITEMS_PER_PAGE), [totalItems]);

  const handleEdit = useCallback((medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setIsLoading(true);
    const result = await medicineService.delete(id);
    if (result.success) {
      setRefreshKey(prev => prev + 1);
    } else {
      alert(result.message || "Erro ao excluir.");
      setIsLoading(false);
    }
  }, []);

  const handleClearExpired = async () => {
    if (!hasExpiredItems || isPending) return;
    
    setIsLoading(true);
    const result = await medicineService.deleteExpired();
    if (result.success) {
      setRefreshKey(prev => prev + 1);
    } else {
      alert(result.message);
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setCurrentPage(newPage);
      });
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
          <h2 className="text-4xl font-black text-[#02416D] tracking-tight">Medicamentos</h2>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <Pill size={16} className="text-[#AEDD2B]" />
            Gerenciamento de estoque e validades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleClearExpired}
            disabled={!hasExpiredItems || isLoading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
              hasExpiredItems && !isLoading
                ? 'bg-red-500 text-white shadow-red-500/20 hover:scale-[1.02]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Trash2 size={24} />
            LIMPAR VENCIDOS
          </button>

          <button 
            onClick={() => { setSelectedMedicine(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 bg-[#AEDD2B] text-[#02416D] px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#AEDD2B]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={24} />
            NOVO MEDICAMENTO
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-[#AEDD2B]' : 'text-gray-400'}`} size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por Código ou Nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-2xl transition-all outline-none font-medium text-gray-700"
          />
        </div>
        <div className="flex items-center gap-3 bg-[#0A5483]/5 px-6 py-4 rounded-2xl text-[#0A5483] font-bold text-sm">
          <Filter size={18} />
          {totalItems} Registros
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[500px]">
        {isPending && (
          <div className="absolute top-0 left-0 w-full h-1 z-30">
            <div className="h-full bg-[#AEDD2B] animate-pulse" style={{ width: '40%' }} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed lg:table-auto">
            <thead>
              <tr className="bg-[#0A5483] text-white">
                <th className="w-32 px-8 py-6 text-xs font-black uppercase tracking-widest">Código</th>
                <th className="px-6 py-6 text-xs font-black uppercase tracking-widest">Medicamento</th>
                <th className="w-32 px-6 py-6 text-xs font-black uppercase tracking-widest">Lote</th>
                <th className="w-40 px-6 py-6 text-xs font-black uppercase tracking-widest">Validade</th>
                <th className="w-48 px-6 py-6 text-xs font-black uppercase tracking-widest">Situação</th>
                <th className="w-40 px-8 py-6 text-xs font-black uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <MedicineSkeleton />
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {medicines.length > 0 ? (
                    medicines.map((medicine) => (
                      <MedicineRow 
                        key={medicine.id}
                        medicine={medicine}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <FileWarning size={64} className="mb-4 text-[#02416D] opacity-20" />
                          <h4 className="text-xl font-bold text-[#02416D]">Nenhum medicamento encontrado</h4>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalItems > 0 && (
          <div className="bg-white px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-gray-500">
              Exibindo <span className="text-[#02416D] font-bold">{paginationRange.startRecord}–{paginationRange.endRecord}</span> de <span className="text-[#02416D] font-bold">{totalItems}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 font-bold text-xs ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#02416D] hover:bg-[#F8F8EC]'
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
                      disabled={isPending}
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
                disabled={currentPage === totalPages || isPending}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 font-bold text-xs ${
                  currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#02416D] hover:bg-[#F8F8EC]'
                }`}
              >
                <span className="hidden sm:inline">PRÓXIMO</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <MedicineFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        medicineToEdit={selectedMedicine}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
};

export default MedicamentosPage;
