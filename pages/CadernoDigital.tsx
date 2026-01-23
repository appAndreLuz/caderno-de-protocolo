
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2, 
  Book as BookIcon, 
  Info, 
  RotateCcw,
  Navigation
} from 'lucide-react';

const CadernoDigital: React.FC = () => {
  const [nafs, setNafs] = useState<NAF[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(2);
  const [searchPage, setSearchPage] = useState('');

  const LINES_PER_PAGE = 31;
  const TOTAL_PAGES = 100;

  useEffect(() => {
    const fetchAllNafs = async () => {
      setLoading(true);
      // LÓGICA DE FILA (FIFO): 
      // O primeiro a entrar é o primeiro da lista (Pág 2, Linha 1)
      const { data, error } = await supabase
        .from('nafs')
        .select('*, fornecedor:fornecedores(razao_social)')
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setNafs(data);
      }
      setLoading(false);
    };

    fetchAllNafs();
  }, []);

  const getPageData = (page: number) => {
    const startIndex = (page - 2) * LINES_PER_PAGE;
    const pageData = nafs.slice(startIndex, startIndex + LINES_PER_PAGE);
    
    const rows = [...pageData];
    while (rows.length < LINES_PER_PAGE) {
      rows.push(null as any);
    }
    return rows;
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(searchPage);
    if (p >= 2 && p <= TOTAL_PAGES) {
      setCurrentPage(p);
      setSearchPage('');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={64} strokeWidth={1} />
          <BookIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
        </div>
        <div className="text-center">
          <p className="text-blue-900 font-black uppercase tracking-[0.3em] text-xs">Organizando Fila Cronológica</p>
          <p className="text-gray-400 text-[10px] uppercase font-bold mt-2">Sincronizando registros com o Livro Digital...</p>
        </div>
      </div>
    );
  }

  const currentRows = getPageData(currentPage);

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn pb-10">
      
      {/* Barra de Ferramentas Estilizada */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-[2rem] border border-stone-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <BookIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-none">Livro de Protocolos</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Visualização Histórica • 31 Registros por Folha</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <form onSubmit={handleGoToPage} className="relative group">
            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={14} />
            <input 
              type="number" 
              placeholder="SALTAR PARA PÁG..." 
              value={searchPage}
              onChange={(e) => setSearchPage(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest w-44 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all outline-none"
            />
          </form>

          <div className="h-10 w-[1px] bg-gray-100 mx-2 hidden md:block"></div>

          <div className="flex items-center bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 p-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(2, prev - 1))}
              disabled={currentPage === 2}
              className="p-2 text-white/40 hover:text-white disabled:opacity-10 transition-all hover:scale-110"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="px-4 py-1 flex flex-col items-center min-w-[80px]">
              <span className="text-[9px] font-black text-white/50 uppercase leading-none mb-1">Folha</span>
              <span className="text-sm font-black text-white leading-none">#{currentPage}</span>
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(TOTAL_PAGES, prev + 1))}
              disabled={currentPage === TOTAL_PAGES}
              className="p-2 text-white/40 hover:text-white disabled:opacity-10 transition-all hover:scale-110"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Notebook Visualizer */}
      <div className="flex-1 flex justify-center pb-8">
        <div className="w-full max-w-5xl flex shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-r-[2.5rem] overflow-hidden min-h-[1100px] bg-white border border-stone-200">
          
          {/* Spine / Espiral Realista */}
          <div className="w-16 bg-stone-50 flex flex-col items-center py-12 space-y-6 border-r border-stone-200 shadow-[inset_-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
             {Array.from({length: 26}).map((_, i) => (
               <div key={i} className="w-8 h-3 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-400 rounded-full shadow-sm border-t border-white/20"></div>
             ))}
          </div>

          {/* Page Content */}
          <div className="flex-1 notebook-page relative flex flex-col font-sans">
            
            <div className="absolute left-[2.5rem] top-0 bottom-0 w-[1px] bg-red-200 z-10"></div>

            {/* Page Header Area */}
            <div className="h-32 flex flex-col justify-end px-14 pb-4 border-b-2 border-blue-900">
               <div className="flex justify-between items-end w-full">
                  <div>
                    <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.4em] leading-none mb-2">Protocolo de Recebimento de Notas</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-black text-blue-900 tracking-tighter uppercase italic">Livro de Registro Digital</span>
                      <div className="px-3 py-1 bg-blue-50 rounded-lg text-[9px] font-black text-blue-600 border border-blue-100 uppercase tracking-widest">Original</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-16 h-16 border-4 border-blue-900 rounded-full flex flex-col items-center justify-center mb-2 rotate-12 opacity-80">
                      <span className="text-[8px] font-black text-blue-600 uppercase leading-none">Pág.</span>
                      <span className="text-xl font-black text-blue-900 leading-none">{currentPage}</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Column Headers */}
            <div className="h-8 flex items-center bg-gray-50/50 border-b border-gray-200 px-14 z-20">
               <div className="w-12"></div>
               <div className="flex-1 flex items-center space-x-6">
                 <div className="w-24 text-[9px] font-black text-gray-400 uppercase tracking-widest">Data Ent.</div>
                 <div className="w-28 text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocolo</div>
                 <div className="flex-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fornecedor Responsável</div>
                 <div className="w-24 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</div>
                 <div className="w-20 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Status</div>
               </div>
            </div>

            {/* Data Rows */}
            <div className="flex-1 relative">
              {currentRows.map((naf, index) => (
                <div 
                  key={index} 
                  className={`h-8 flex items-center group relative border-b border-stone-100/50 hover:bg-blue-50/20 transition-all`}
                  style={{ height: '2rem' }}
                >
                  <div className="w-10 flex justify-center text-[9px] font-black text-gray-200 pointer-events-none italic">
                    {index + 1}
                  </div>

                  <div className="flex-1 flex items-center px-6 space-x-6 overflow-hidden">
                    {naf ? (
                      <>
                        <div className="w-24 text-[10px] font-bold text-gray-500">{formatDate(naf.data_entrada)}</div>
                        <div className="w-28 font-black text-gray-900 italic text-xs tracking-tight">
                           {naf.numero_naf} <span className="text-gray-300">/</span> {naf.numero_subnaf}
                        </div>
                        <div className="flex-1 font-black text-blue-800 text-[11px] uppercase truncate tracking-tight handwritten">
                          {naf.fornecedor?.razao_social}
                        </div>
                        <div className="w-24 font-black text-blue-900 text-[11px] text-right tabular-nums">
                          {formatCurrency(naf.valor)}
                        </div>
                        <div className="w-20 text-right">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${naf.data_baixa ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {naf.data_baixa ? '✓ Baixada' : '• Aberta'}
                          </span>
                        </div>
                        
                        <div className="absolute right-0 top-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                          <div className="bg-blue-900 text-white p-4 rounded-2xl text-[10px] shadow-2xl z-30 flex items-center space-x-3 -translate-x-4">
                            <Info size={14} className="text-amber-400" />
                            <span className="font-bold uppercase whitespace-nowrap tracking-wider">OBS: {naf.observacao || 'NENHUMA'}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 h-[1px]"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Page Footer Area */}
            <div className="h-16 flex items-center justify-between px-14 border-t-4 border-blue-900 bg-gray-50/50">
               <div className="flex items-center space-x-4">
                 <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                 <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest italic">Autenticado via André Protocolo</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Pág {currentPage} de 100</span>
                 <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest tracking-tighter">Gerado em: {new Date().toLocaleDateString()}</span>
               </div>
            </div>
          </div>
          
          <div className="w-4 bg-gradient-to-r from-gray-200 to-gray-50 border-l border-gray-300"></div>
        </div>
      </div>
      
      <button 
        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentPage(2); }}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all group z-50"
      >
        <RotateCcw size={22} className="group-hover:rotate-180 transition-transform duration-500" />
      </button>

    </div>
  );
};

export default CadernoDigital;
