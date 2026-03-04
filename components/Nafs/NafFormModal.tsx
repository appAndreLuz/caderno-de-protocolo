
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { NAF, Supplier } from '../../types';
import { supplierService } from '../../services/supplierService';
import { nafService } from '../../services/nafService';
import { getLocalDateISO } from '../../utils/dateUtils';

interface NafFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nafToEdit?: NAF | null;
}

const NafFormModal: React.FC<NafFormModalProps> = ({ isOpen, onClose, onSuccess, nafToEdit }) => {
  const [formData, setFormData] = useState({
    entry_date: getLocalDateISO(),
    naf_number: '',
    subnaf_number: '',
    supplier_id: '',
    value: '',
    observation: '',
    is_cancelled: false
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [nextPos, setNextPos] = useState({ page_number: 2, line_number: 1, isBlocked: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      if (!isOpen) return;
      
      setIsLoadingSuppliers(true);
      const [sResult, pResult] = await Promise.all([
        supplierService.list(),
        nafService.getNextPosition()
      ]);
      setSuppliers(sResult);
      setNextPos(pResult);
      setIsLoadingSuppliers(false);

      if (nafToEdit) {
        setFormData({
          entry_date: nafToEdit.entry_date.split('T')[0],
          naf_number: nafToEdit.naf_number?.toString() || '',
          subnaf_number: nafToEdit.subnaf_number?.toString() || '',
          supplier_id: nafToEdit.supplier_id,
          value: nafToEdit.value.toString().replace('.', ','),
          observation: nafToEdit.observation || '',
          is_cancelled: !!nafToEdit.is_cancelled
        });
      } else {
        setFormData({
          entry_date: getLocalDateISO(),
          naf_number: '',
          subnaf_number: '',
          supplier_id: '',
          value: '',
          observation: '',
          is_cancelled: false
        });
      }
      setErrors({});
      setStatus('idle');
    };

    init();
  }, [nafToEdit, isOpen]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (Number(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    setFormData({ ...formData, value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.entry_date) newErrors.entry_date = "Data obrigatória.";
    if (!formData.naf_number.trim()) newErrors.naf_number = "Nº NAF obrigatório.";
    if (!formData.subnaf_number.trim()) newErrors.subnaf_number = "Nº SUBNAF obrigatório.";
    if (!formData.supplier_id) newErrors.supplier_id = "Selecione um fornecedor.";
    if (!formData.value) newErrors.value = "Valor obrigatório.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus('idle');
    const numericValue = parseFloat(formData.value.replace(/\./g, '').replace(',', '.'));
    
    const result = await nafService.save({
      entry_date: formData.entry_date,
      naf_number: formData.naf_number.trim(),
      subnaf_number: formData.subnaf_number.trim(),
      supplier_id: formData.supplier_id,
      value: numericValue,
      observation: formData.observation,
      is_cancelled: formData.is_cancelled
    }, nafToEdit?.id);

    if (result.success) {
      setStatus('success');
      setServerMsg(result.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setStatus('error');
      setServerMsg(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02416D]/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header seguindo o padrão do cadastro de fornecedores */}
            <div className="bg-[#0A5483] px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{nafToEdit ? 'Editar NAF' : 'Novo Protocolo NAF'}</h3>
                <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mt-1">Caderno Digital</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4">
              <div className="bg-[#F8F8EC] p-6 border-r border-gray-100 hidden md:block">
                <p className="text-[10px] font-black text-[#0A5483] uppercase tracking-widest mb-6">Localização no Caderno</p>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#AEDD2B]/30 relative overflow-hidden group">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Página</p>
                    <p className="text-3xl font-black text-[#02416D]">{nafToEdit ? nafToEdit.page_number : nextPos.page_number}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#066699]/20 relative overflow-hidden group">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Linha</p>
                    <p className="text-3xl font-black text-[#066699]">{nafToEdit ? nafToEdit.line_number : nextPos.line_number}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="md:col-span-3 p-8 space-y-6">
                {status === 'error' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 animate-in fade-in">
                    <AlertCircle className="text-red-500 shrink-0" />
                    <p className="text-red-700 text-sm font-medium">{serverMsg}</p>
                  </div>
                )}
                {status === 'success' && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 flex gap-3 animate-in fade-in">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    <p className="text-green-700 text-sm font-medium">{serverMsg}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">Data da Entrada *</label>
                    <input type="date" value={formData.entry_date} onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })} className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 outline-none font-bold text-sm text-[#000000] ${errors.entry_date ? 'border-red-300 bg-red-50' : ''}`} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">Nº NAF *</label>
                      <input type="text" maxLength={10} value={formData.naf_number} onChange={(e) => setFormData({ ...formData, naf_number: e.target.value })} className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 outline-none font-bold text-sm text-[#000000] ${errors.naf_number ? 'border-red-300 bg-red-50' : ''}`} placeholder="000000" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">SUB *</label>
                      <input type="text" maxLength={5} value={formData.subnaf_number} onChange={(e) => setFormData({ ...formData, subnaf_number: e.target.value })} className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 outline-none font-bold text-sm text-[#000000] ${errors.subnaf_number ? 'border-red-300 bg-red-50' : ''}`} placeholder="00" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">Fornecedor *</label>
                    <div className="relative">
                      {isLoadingSuppliers ? (
                        <div className="absolute right-4 top-3 z-10"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
                      ) : (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown size={18} /></div>
                      )}
                      <select value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })} className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 outline-none font-bold text-sm appearance-none transition-all ${formData.supplier_id ? 'text-[#000000]' : 'text-gray-400'} ${errors.supplier_id ? 'border-red-300 bg-red-50' : ''}`}>
                        <option value="">Selecione um Fornecedor...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">Valor *</label>
                    <input type="text" value={formData.value} onChange={handleCurrencyChange} className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 outline-none font-bold text-sm text-[#000000] ${errors.value ? 'border-red-300 bg-red-50' : ''}`} placeholder="0,00" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">Observação</label>
                    <textarea value={formData.observation} onChange={(e) => setFormData({ ...formData, observation: e.target.value.toUpperCase() })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 outline-none font-bold text-sm min-h-[80px] resize-none uppercase text-[#000000]" placeholder="INFORMAÇÕES ADICIONAIS..." />
                  </div>

                  {nafToEdit && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={formData.is_cancelled} 
                            onChange={(e) => setFormData({ ...formData, is_cancelled: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_cancelled ? 'bg-red-500' : 'bg-gray-200'}`} />
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_cancelled ? 'translate-x-6' : ''}`} />
                        </div>
                        <span className="text-xs font-bold text-[#02416D] uppercase tracking-wider">Marcar como Protocolo CANCELADO</span>
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                  <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors" disabled={isSubmitting}>Cancelar</button>
                  <button type="submit" disabled={isSubmitting || (nextPos.isBlocked && !nafToEdit)} className="flex items-center gap-2 px-8 py-3 bg-[#AEDD2B] text-[#02416D] font-black rounded-xl shadow-lg transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {nafToEdit ? 'ATUALIZAR' : 'CADASTRAR PROTOCOLO'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NafFormModal;
