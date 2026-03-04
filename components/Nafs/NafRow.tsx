
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, RotateCcw, Ban, XCircle } from 'lucide-react';
import { NAF } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface NafRowProps {
  naf: NAF;
  onEdit: (naf: NAF) => void;
  onRevert: (nafId: string) => void;
}

const NafRow: React.FC<NafRowProps> = React.memo(({ naf, onEdit, onRevert }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const isBaixada = !!naf.data_saida;
  const isCancelled = !!naf.is_cancelled;
  
  let situacao = 'NA PASTA';
  let statusColor = 'text-[#0A5483]';
  
  if (isCancelled) {
    situacao = 'CANCELADA';
    statusColor = 'text-red-500';
  } else if (isBaixada) {
    situacao = 'BAIXADA';
    statusColor = 'text-orange-500';
  }

  // Fallback seguro para garantir que os dados apareçam mesmo se forem números ou strings
  const nafVal = (naf.naf_number !== undefined && naf.naf_number !== null) ? naf.naf_number : '---';
  const subVal = (naf.subnaf_number !== undefined && naf.subnaf_number !== null) ? naf.subnaf_number : '--';

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group hover:bg-[#F8F8EC] transition-colors"
    >
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#02416D]">{formatDate(naf.entry_date)}</span>
          {isBaixada && (
            <span className="text-[10px] font-black text-orange-500 uppercase mt-1">
              SAÍDA: {formatDate(naf.data_saida!)}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-6 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[#02416D]">{nafVal}</span>
          <span className="text-gray-300 font-light">/</span>
          <span className="text-sm font-bold text-gray-500">{subVal}</span>
        </div>
      </td>
      <td className="px-6 py-6">
        <p className="text-sm font-bold text-[#0A5483] truncate max-w-[250px] uppercase">
          {naf.suppliers?.name || '---'}
        </p>
      </td>
      <td className="px-6 py-6">
        <span className="text-sm font-black text-[#02416D]">{formatCurrency(naf.value)}</span>
      </td>
      <td className="px-6 py-6">
        <span className={`text-xs font-black uppercase tracking-widest ${statusColor}`}>
          {situacao}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          {isBaixada && (
            <button 
              onClick={() => onRevert(naf.id)}
              className="p-3 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all inline-flex items-center gap-2 font-bold text-sm group-hover:shadow-md"
              title="Estornar Baixa"
            >
              <RotateCcw size={16} />
              <span className="hidden lg:inline">ESTORNAR</span>
            </button>
          )}
          <button 
            onClick={() => onEdit(naf)}
            className="p-3 text-[#066699] hover:bg-[#066699] hover:text-white rounded-xl transition-all inline-flex items-center gap-2 font-bold text-sm group-hover:shadow-md"
          >
            <Edit2 size={16} />
            <span className="hidden lg:inline">EDITAR</span>
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

NafRow.displayName = 'NafRow';

export default NafRow;
