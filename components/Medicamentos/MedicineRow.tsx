
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Pill, AlertCircle, CheckCircle2, FileWarning } from 'lucide-react';
import { Medicine } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface MedicineRowProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}

const MedicineRow: React.FC<MedicineRowProps> = React.memo(({ medicine, onEdit, onDelete }) => {
  // Mapeamento de status para ícones e cores corporativas existentes
  const getStatusIcon = () => {
    switch (medicine.status_validade) {
      case 'critico':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'atencao':
        return <FileWarning size={16} className="text-orange-500" />;
      case 'em_dia':
      default:
        return <CheckCircle2 size={16} className="text-[#AEDD2B]" />;
    }
  };

  const getStatusLabel = () => {
    if (medicine.dias_para_vencer !== undefined && medicine.dias_para_vencer < 0) return 'Vencido';
    if (medicine.status_validade === 'critico') return 'Crítico';
    if (medicine.status_validade === 'atencao') return 'Atenção';
    return 'Em dia';
  };

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group hover:bg-[#F8F8EC] transition-colors"
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0A5483]/5 rounded-lg text-[#0A5483]">
            <Pill size={16} />
          </div>
          <span className="font-mono font-bold text-[#02416D]">{medicine.codigo_medicamento}</span>
        </div>
      </td>
      <td className="px-6 py-6">
        <p className="font-black text-[#02416D] truncate max-w-[200px] lg:max-w-[300px] uppercase">
          {medicine.nome_medicamento}
        </p>
      </td>
      <td className="px-6 py-6 font-bold text-gray-500 uppercase text-sm">
        {medicine.lote}
      </td>
      <td className="px-6 py-6">
        <span className="text-sm font-bold text-[#066699] bg-[#066699]/5 px-3 py-1 rounded-full whitespace-nowrap">
          {formatDate(medicine.data_validade)}
        </span>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-xs font-black uppercase tracking-wider ${
              medicine.status_validade === 'critico' ? 'text-red-500' : 
              medicine.status_validade === 'atencao' ? 'text-orange-500' : 
              'text-[#AEDD2B]'
            }`}>
              {getStatusLabel()}
            </span>
          </div>
          {medicine.dias_para_vencer !== undefined && (
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
              {medicine.dias_para_vencer < 0 ? 'Expirou há ' : 'Vence em '}
              {Math.abs(medicine.dias_para_vencer)} dias
            </span>
          )}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => onEdit(medicine)}
            className="p-3 text-[#066699] hover:bg-[#066699] hover:text-white rounded-xl transition-all inline-flex items-center gap-2 font-bold text-sm group-hover:shadow-md"
          >
            <Edit2 size={16} />
            <span className="hidden lg:inline">EDITAR</span>
          </button>
          <button 
            onClick={() => onDelete(medicine.lote)} // Passando o lote para a exclusão em vez do ID UUID
            className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all inline-flex items-center gap-2 font-bold text-sm group-hover:shadow-md"
          >
            <Trash2 size={16} />
            <span className="hidden lg:inline">EXCLUIR</span>
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

MedicineRow.displayName = 'MedicineRow';

export default MedicineRow;
