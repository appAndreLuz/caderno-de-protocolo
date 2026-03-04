
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ExternalLink } from 'lucide-react';
import { NAF } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface NotebookPageProps {
  pageNumber: number;
  nafs: NAF[];
  side: 'left' | 'right';
}

const NotebookPage: React.FC<NotebookPageProps> = ({ pageNumber, nafs, side }) => {
  const [hoveredNaf, setHoveredNaf] = useState<NAF | null>(null);

  const lines = Array.from({ length: 31 }, (_, i) => {
    const lineNum = i + 1;
    return nafs.find(n => n.line_number === lineNum) || null;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className={`h-full relative flex flex-col ${side === 'left' ? 'pr-4' : 'pl-4'}`}>
      {/* Header Section */}
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.3em]">Protocolo de Recebimento de Notas</p>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-[#1E3A8A] italic tracking-tight uppercase">Caderno Digital</h3>
              <span className="px-3 py-1 bg-[#EFF6FF] text-[#3B82F6] text-[10px] font-black rounded-lg border border-[#DBEAFE] uppercase tracking-widest">Original</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#1E3A8A] flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-[#1E3A8A] uppercase leading-none">Pág.</span>
              <span className="text-xl font-black text-[#1E3A8A] leading-none">{pageNumber}</span>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_90px_110px_1fr_110px_100px_90px] border-y-2 border-[#1E3A8A] py-2 px-4 bg-white/50">
          <span className="text-[9px] font-black text-[#64748B] uppercase text-center">#</span>
          <span className="text-[9px] font-black text-[#64748B] uppercase text-center">Data Ent.</span>
          <span className="text-[9px] font-black text-[#64748B] uppercase text-center">Protocolo</span>
          <span className="text-[9px] font-black text-[#64748B] uppercase">Fornecedor Responsável</span>
          <span className="text-[9px] font-black text-[#64748B] uppercase text-right">Valor</span>
          <span className="text-[9px] font-black text-[#64748B] uppercase text-center">Saída</span>
          <span className="text-[9px] font-black text-[#64748B] uppercase text-center">Status</span>
        </div>
      </div>

      {/* Margem Vertical Vermelha */}
      <div className={`absolute top-0 h-full w-[1.5px] bg-[#FCA5A5] opacity-40 ${side === 'left' ? 'left-16' : 'left-16'}`} />

      {/* Table Body */}
      <div className="flex-1 px-8 overflow-hidden">
        {lines.map((naf, idx) => (
          <div 
            key={idx} 
            className="grid grid-cols-[40px_90px_110px_1fr_110px_100px_90px] h-8 border-b border-[#E2E8F0] items-center px-4 hover:bg-[#F1F5F9]/50 transition-colors group cursor-default relative"
            onMouseEnter={() => naf && setHoveredNaf(naf)}
            onMouseLeave={() => setHoveredNaf(null)}
          >
            {/* Row Number */}
            <span className="text-[10px] font-bold text-[#94A3B8] text-center">{idx + 1}</span>
            
            {naf ? (
              <>
                <span className="text-[11px] font-medium text-[#475569] text-center">{formatDate(naf.entry_date)}</span>
                <span className="text-[12px] font-black text-[#1E293B] text-center italic">{naf.naf_number} <span className="text-[#94A3B8] font-normal">/</span> {naf.subnaf_number}</span>
                <span className="text-[11px] font-bold text-[#2563EB] uppercase truncate pr-4">{naf.suppliers?.name}</span>
                <span className="text-[12px] font-black text-[#1E293B] text-right">{formatCurrency(naf.value)}</span>
                <span className="text-[11px] font-bold text-[#64748B] text-center">
                  {naf.data_saida ? formatDate(naf.data_saida) : '-'}
                </span>
                <div className="flex justify-center">
                  <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${naf.is_cancelled ? 'text-red-500' : naf.data_saida ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                    {naf.is_cancelled ? (
                      <><span className="text-[12px]">✕</span> CANCELADA</>
                    ) : naf.data_saida ? (
                      <><span className="text-[12px]">✓</span> BAIXADA</>
                    ) : (
                      <><span className="text-[14px] leading-none">•</span> ABERTA</>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-6 flex items-center px-4">
                <span className="text-[9px] text-[#CBD5E1] italic font-medium tracking-widest uppercase">--- Disponível ---</span>
              </div>
            )}

            {/* Tooltip (Simplified) */}
            <AnimatePresence>
              {hoveredNaf?.id === naf?.id && hoveredNaf?.observation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute z-50 left-1/2 -translate-x-1/2 -top-12 bg-[#1E293B] text-white p-3 rounded-xl shadow-xl text-[10px] min-w-[200px] pointer-events-none"
                >
                  <p className="font-black text-[#94A3B8] uppercase text-[8px] mb-1">Observação:</p>
                  <p className="italic">"{hoveredNaf.observation}"</p>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E293B] rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer Decoration */}
      <div className="p-6 flex justify-between items-center opacity-20 grayscale">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#1E3A8A] flex items-center justify-center font-black text-[#1E3A8A] text-xs">PC</div>
          <span className="text-[8px] font-black text-[#1E3A8A] uppercase tracking-widest">ProtoCaderno Digital v2.0</span>
        </div>
        <span className="text-[8px] font-bold text-[#1E3A8A] uppercase">Autenticação de Registro Interno</span>
      </div>
    </div>
  );
};

export default NotebookPage;
