
import React, { useState } from 'react';
import { Search, Loader2, FileText, BookOpen, Calendar, AlertCircle, CheckCircle2, Clock, Ban, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { nafService } from '../../services/nafService';
import { NAF } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const QuickSearchCard: React.FC = () => {
  const [nafNumber, setNafNumber] = useState('');
  const [subnafNumber, setSubnafNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<NAF[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nafNumber.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await nafService.quickSearch(nafNumber, subnafNumber);
      setResults(data);
    } catch (error) {
      console.error("Erro na busca rápida:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSituation = (naf: NAF) => {
    if (naf.is_cancelled) return { label: 'Cancelada', color: 'bg-red-500 text-white', icon: <XCircle size={12} /> };
    if (naf.data_saida) return { label: 'Baixada', color: 'bg-slate-900 text-white', icon: <Ban size={12} /> };
    if (naf.data_cobranca) return { label: 'Em Cobrança', color: 'bg-[#0A5483] text-white', icon: <Clock size={12} /> };
    return { label: 'Aberta', color: 'bg-[#AEDD2B] text-[#02416D]', icon: <CheckCircle2 size={12} /> };
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-700 h-full flex flex-col transition-all hover:shadow-[#AEDD2B]/10 group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[#02416D] dark:text-white font-bold text-lg tracking-tight">Pesquisar NAF</h4>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Localização Rápida</p>
        </div>
        <div className="p-2.5 bg-[#F8F8EC] dark:bg-slate-700 text-[#AEDD2B] rounded-2xl shadow-lg shadow-[#AEDD2B]/10 transition-transform group-hover:scale-110">
          <Search size={20} />
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Número NAF</label>
            <input
              type="text"
              value={nafNumber}
              onChange={(e) => setNafNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-[#AEDD2B] rounded-2xl outline-none font-bold text-sm text-[#02416D] dark:text-white transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">SubNAF</label>
            <input
              type="text"
              value={subnafNumber}
              onChange={(e) => setSubnafNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="00"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-[#AEDD2B] rounded-2xl outline-none font-bold text-sm text-[#02416D] dark:text-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !nafNumber.trim()}
          className="w-full bg-[#0A5483] hover:bg-[#02416D] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          PESQUISAR
        </button>
      </form>

      <div className="mt-6 flex-1 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 gap-3"
            >
              <div className="w-8 h-8 border-3 border-[#0A5483]/10 border-t-[#AEDD2B] rounded-full animate-spin" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Buscando...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {results.map((naf) => {
                const situation = getSituation(naf);
                return (
                  <div key={naf.id} className="p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 hover:border-[#AEDD2B]/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                          <FileText size={14} className="text-[#0A5483]" />
                        </div>
                        <span className="text-sm font-black text-[#02416D] dark:text-white">
                          {naf.naf_number} / {naf.subnaf_number}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${situation.color}`}>
                        {situation.icon}
                        {situation.label}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={12} className="text-[#AEDD2B]" />
                        <div>
                          <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Página</p>
                          <p className="text-[11px] font-black text-[#0A5483] dark:text-slate-300">{naf.page_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-[#AEDD2B]" />
                        <div>
                          <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Entrada</p>
                          <p className="text-[11px] font-black text-[#0A5483] dark:text-slate-300">{formatDate(naf.entry_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : hasSearched && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <AlertCircle size={32} className="text-orange-400 opacity-20 mb-3" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NAF não encontrada</p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
              <Search size={32} className="text-gray-300 mb-3" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aguardando pesquisa</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuickSearchCard;
