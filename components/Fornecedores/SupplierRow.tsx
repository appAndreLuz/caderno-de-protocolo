
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Supplier } from '../../types';
import { maskDocument, maskPhone } from '../../utils/masks';

interface SupplierRowProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
}

/**
 * Componente de linha memoizado. 
 * Só renderiza novamente se o objeto supplier ou a função onEdit mudar.
 */
const SupplierRow: React.FC<SupplierRowProps> = React.memo(({ supplier, onEdit }) => {
  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group hover:bg-[#F8F8EC] transition-colors"
    >
      <td className="px-8 py-6">
        <p className="font-black text-[#02416D] truncate max-w-[300px] uppercase">
          {supplier.name}
        </p>
        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">ID: {supplier.id.split('-')[0]}</p>
      </td>
      <td className="px-6 py-6 font-mono font-bold text-sm text-gray-600">
        {maskDocument(supplier.document)}
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700">{supplier.phone ? maskPhone(supplier.phone) : 'Sem Telefone'}</span>
          <span className="text-xs text-gray-400 lowercase">{supplier.email || 'Sem E-mail'}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <button 
          onClick={() => onEdit(supplier)}
          className="p-3 text-[#066699] hover:bg-[#066699] hover:text-white rounded-xl transition-all inline-flex items-center gap-2 font-bold text-sm group-hover:shadow-md"
        >
          <Edit2 size={16} />
          <span className="hidden lg:inline">EDITAR</span>
        </button>
      </td>
    </motion.tr>
  );
});

SupplierRow.displayName = 'SupplierRow';

export default SupplierRow;
