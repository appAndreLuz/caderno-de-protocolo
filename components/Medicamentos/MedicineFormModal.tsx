
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, CheckCircle2, Pill } from 'lucide-react';
import { Medicine } from '../../types';
import { medicineService } from '../../services/medicineService';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medicineToEdit?: Medicine | null;
}

const MedicineFormModal: React.FC<MedicineFormModalProps> = ({ isOpen, onClose, onSuccess, medicineToEdit }) => {
  const [formData, setFormData] = useState({
    codigo_medicamento: '',
    nome_medicamento: '',
    lote: '',
    data_validade: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    if (medicineToEdit) {
      setFormData({
        codigo_medicamento: medicineToEdit.codigo_medicamento,
        nome_medicamento: medicineToEdit.nome_medicamento,
        lote: medicineToEdit.lote,
        data_validade: medicineToEdit.data_validade
      });
    } else {
      setFormData({ codigo_medicamento: '', nome_medicamento: '', lote: '', data_validade: '' });
    }
    setErrors({});
    setStatus('idle');
  }, [medicineToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo_medicamento.trim()) {
      newErrors.codigo_medicamento = "O código é obrigatório.";
    } else if (!/^\d+$/.test(formData.codigo_medicamento)) {
      newErrors.codigo_medicamento = "O código deve conter apenas números.";
    }

    if (!formData.nome_medicamento.trim()) {
      newErrors.nome_medicamento = "O nome é obrigatório.";
    }

    if (!formData.lote.trim()) {
      newErrors.lote = "O lote é obrigatório.";
    }

    if (!formData.data_validade) {
      newErrors.data_validade = "A validade é obrigatória.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus('idle');

    const result = await medicineService.save(formData, medicineToEdit?.id);

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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02416D]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#0A5483] px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#AEDD2B] rounded-xl flex items-center justify-center text-[#02416D]">
                  <Pill size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{medicineToEdit ? 'Editar Medicamento' : 'Novo Medicamento'}</h3>
                  <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mt-1">Farmácia / Estoque</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {status === 'error' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="text-red-500 shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{serverMsg}</p>
                </div>
              )}

              {status === 'success' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 flex gap-3 animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 className="text-green-500 shrink-0" />
                  <p className="text-green-700 text-sm font-medium">{serverMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    Código do Medicamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_medicamento}
                    onChange={(e) => setFormData({ ...formData, codigo_medicamento: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-bold text-sm text-[#000000] ${errors.codigo_medicamento ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                    placeholder="Somente números"
                  />
                  {errors.codigo_medicamento && <p className="mt-1 text-xs text-red-500 font-medium">{errors.codigo_medicamento}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    Lote <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lote}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-bold text-sm text-[#000000] ${errors.lote ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                    placeholder="Ex: ABC123"
                  />
                  {errors.lote && <p className="mt-1 text-xs text-red-500 font-medium">{errors.lote}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    Nome do Medicamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome_medicamento}
                    onChange={(e) => setFormData({ ...formData, nome_medicamento: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none uppercase font-bold text-sm text-[#000000] ${errors.nome_medicamento ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                    placeholder="Digite o nome completo"
                  />
                  {errors.nome_medicamento && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nome_medicamento}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    Data de Validade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.data_validade}
                    onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-bold text-sm text-[#000000] ${errors.data_validade ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                  />
                  {errors.data_validade && <p className="mt-1 text-xs text-red-500 font-medium">{errors.data_validade}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 bg-[#AEDD2B] text-[#02416D] font-black rounded-xl shadow-lg transition-all active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#9cc427]'}`}
                >
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Save size={20} />
                    </motion.div>
                  ) : (
                    <Save size={20} />
                  )}
                  {medicineToEdit ? 'ATUALIZAR' : 'CADASTRAR'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MedicineFormModal;
