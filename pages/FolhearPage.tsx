
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAF } from '../types';
import { nafService } from '../services/nafService';
import NotebookView from '../components/Notebook/NotebookView';

const FolhearPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(2);
  const [pageCache, setPageCache] = useState<Record<number, NAF[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [jumpPage, setJumpPage] = useState('');
  const [searchNaf, setSearchNaf] = useState('');
  const [searchSub, setSearchSub] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  
  const prefetchRange = 5; // Prefetch 5 pages ahead

  const loadPages = useCallback(async (start: number, end: number) => {
    const missingPages = [];
    for (let p = start; p <= end; p++) {
      if (!pageCache[p]) missingPages.push(p);
    }

    if (missingPages.length === 0) return;

    try {
      const data = await nafService.listByPageRange(start, end);
      
      const newCache = { ...pageCache };
      for (let p = start; p <= end; p++) {
        if (!newCache[p]) newCache[p] = [];
      }
      
      data.forEach(naf => {
        if (!newCache[naf.page_number]) newCache[naf.page_number] = [];
        newCache[naf.page_number].push(naf);
      });
      
      setPageCache(newCache);
    } catch (err) {
      console.error("Error loading pages:", err);
    }
  }, [pageCache]);

  useEffect(() => {
    const init = async () => {
      if (!pageCache[currentPage]) {
        setIsLoading(true);
      }
      await loadPages(currentPage, currentPage);
      setIsLoading(false);
      
      const nextStart = currentPage + 1;
      const nextEnd = Math.min(101, nextStart + prefetchRange);
      if (nextStart <= 101) {
        loadPages(nextStart, nextEnd);
      }
    };
    init();
  }, [currentPage, loadPages]);

  const handleNext = () => {
    if (currentPage < 101) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 2) {
      setDirection(-1);
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpPage);
    if (!isNaN(page) && page >= 2 && page <= 101) {
      setDirection(page > currentPage ? 1 : -1);
      setCurrentPage(page);
      setJumpPage('');
    }
  };

  const handleNafSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNaf || !searchSub) return;

    setIsSearching(true);
    try {
      const page = await nafService.findPageByNumbers(searchNaf, searchSub);
      if (page) {
        setDirection(page > currentPage ? 1 : -1);
        setCurrentPage(page);
        setSearchNaf('');
        setSearchSub('');
      } else {
        alert("NAF não encontrada neste caderno.");
      }
    } catch (err) {
      console.error("Erro na busca:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const currentNafs = pageCache[currentPage] || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 select-none paper-texture">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black text-[#02416D] tracking-tight flex items-center gap-3">
            Folhear Caderno
            <div className="px-3 py-1 bg-[#AEDD2B] text-[#02416D] rounded-full text-xs font-black uppercase tracking-widest shadow-sm">Digital</div>
          </h2>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <BookOpen size={16} className="text-[#AEDD2B]" />
            Visão imersiva do protocolo oficial.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleNafSearch} className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 focus-within:border-[#AEDD2B] transition-all">
            <Search size={16} className="text-gray-400 ml-2" />
            <input 
              type="text"
              value={searchNaf}
              onChange={(e) => setSearchNaf(e.target.value)}
              placeholder="NAF"
              className="w-16 px-2 py-2 bg-transparent outline-none text-sm font-bold text-[#02416D]"
            />
            <span className="text-gray-300">/</span>
            <input 
              type="text"
              value={searchSub}
              onChange={(e) => setSearchSub(e.target.value)}
              placeholder="SUB"
              className="w-16 px-2 py-2 bg-transparent outline-none text-sm font-bold text-[#02416D]"
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-[#AEDD2B] text-[#02416D] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#9cc427] transition-colors disabled:opacity-50"
            >
              {isSearching ? '...' : 'BUSCAR'}
            </button>
          </form>

          <form onSubmit={handleJump} className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 focus-within:border-[#AEDD2B] transition-all">
            <input 
              type="number"
              min="2"
              max="101"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="Pág..."
              className="w-16 px-2 py-2 bg-transparent outline-none text-sm font-bold text-[#02416D]"
            />
            <button type="submit" className="bg-[#0A5483] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#02416D] transition-colors">
              IR
            </button>
          </form>
        </div>
      </div>

      <div className="relative perspective-2000">
        <AnimatePresence mode="wait" custom={direction}>
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[800px] flex flex-col items-center justify-center gap-4 text-[#0A5483]"
            >
              <Loader2 className="w-12 h-12 animate-spin text-[#AEDD2B]" />
              <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">Preparando Pergaminhos...</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentPage}
              custom={direction}
              initial={(dir: number) => ({
                rotateY: dir > 0 ? 90 : -90,
                opacity: 0,
                x: dir > 0 ? 200 : -200
              })}
              animate={{ 
                rotateY: 0, 
                opacity: 1,
                x: 0
              }}
              exit={(dir: number) => ({
                rotateY: dir > 0 ? -90 : 90,
                opacity: 0,
                x: dir > 0 ? -200 : 200
              })}
              transition={{ 
                type: "spring",
                stiffness: 150,
                damping: 20
              }}
              className="preserve-3d"
            >
              <NotebookView 
                pageNumber={currentPage}
                nafs={currentNafs}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-8 z-30">
          <button 
            onClick={handlePrev}
            disabled={currentPage <= 2 || isLoading}
            className={`w-16 h-32 flex items-center justify-center bg-white shadow-2xl rounded-r-3xl border-y border-r border-gray-100 transition-all group ${currentPage <= 2 ? 'opacity-0 pointer-events-none' : 'hover:pl-4 text-[#0A5483] hover:bg-[#F8F8EC]'}`}
          >
            <ChevronLeft size={40} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -right-8 z-30">
          <button 
            onClick={handleNext}
            disabled={currentPage >= 101 || isLoading}
            className={`w-16 h-32 flex items-center justify-center bg-white shadow-2xl rounded-l-3xl border-y border-l border-gray-100 transition-all group ${currentPage >= 101 ? 'opacity-0 pointer-events-none' : 'hover:pr-4 text-[#0A5483] hover:bg-[#F8F8EC]'}`}
          >
            <ChevronRight size={40} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Progress Bar */}
        <div className="w-full max-w-2xl bg-gray-200 h-1.5 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentPage - 2) / 99) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#0A5483] to-[#AEDD2B]"
          />
        </div>

        <div className="bg-[#02416D]/5 border border-[#02416D]/10 rounded-2xl p-4 flex items-center gap-3 max-w-lg backdrop-blur-sm">
          <Info size={18} className="text-[#0A5483]" />
          <p className="text-[10px] text-[#0A5483] font-bold uppercase tracking-wider leading-relaxed">
            Navegação otimizada: as páginas são pré-carregadas para uma transição instantânea. 
            Use as setas laterais ou o campo de busca.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FolhearPage;
