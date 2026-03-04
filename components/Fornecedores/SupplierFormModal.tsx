
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Supplier } from '../../types';
import { maskDocument, maskPhone, unmask } from '../../utils/masks';
import { validateDocument, validateEmail } from '../../utils/validators';
import { supplierService } from '../../services/supplierService';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierToEdit?: Supplier | null;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSuccess, supplierToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name,
        document: maskDocument(supplierToEdit.document),
        phone: supplierToEdit.phone ? maskPhone(supplierToEdit.phone) : '',
        email: supplierToEdit.email || ''
      });
    } else {
      setFormData({ name: '', document: '', phone: '', email: '' });
    }
    setErrors({});
    setStatus('idle');
  }, [supplierToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const rawDoc = unmask(formData.document);

    if (!formData.name.trim()) {
      newErrors.name = "O nome/razão social é obrigatório.";
    }

    if (!rawDoc) {
      newErrors.document = "O documento é obrigatório.";
    } else if (rawDoc.length < 11) {
      newErrors.document = "O CPF deve conter no mínimo 11 dígitos.";
    } else if (rawDoc.length > 11 && rawDoc.length < 14) {
      newErrors.document = "O CNPJ está incompleto. Digite os 14 dígitos.";
    } else if (!validateDocument(rawDoc)) {
      newErrors.document = "Documento (CPF/CNPJ) inválido conforme regras fiscais.";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Formato de e-mail inválido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus('idle');

    const result = await supplierService.save(formData, supplierToEdit?.id);

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
              <div>
                <h3 className="text-xl font-bold">{supplierToEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mt-1">Gestão de Parceiros</p>
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    Nome / Razão Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none uppercase font-bold text-sm text-[#000000] ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                    placeholder="EX: FARMACÊUTICA BRASIL LTDA"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    CNPJ / CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: maskDocument(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-bold text-sm text-[#000000] ${errors.document ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                    placeholder="000.000.000-00"
                  />
                  {errors.document && <p className="mt-1 text-xs text-red-500 font-medium">{errors.document}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50 transition-all outline-none font-bold text-sm text-[#000000]"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#02416D] uppercase mb-2 tracking-wider">
                    E-mail
                  </label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none lowercase text-sm font-medium text-[#000000] ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#AEDD2B] bg-gray-50/50'}`}
                    placeholder="exemplo@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
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
                  {supplierToEdit ? 'ATUALIZAR' : 'CADASTRAR'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupplierFormModal;
