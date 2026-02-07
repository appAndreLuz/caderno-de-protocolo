
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Medicamento } from '../types';
import { formatDate, getLocalDateString } from '../utils';
import { 
  Plus, 
  Edit2, 
  Search, 
  X, 
  Pill, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Trash2,
  AlertCircle,
  Info,
  ShieldAlert,
  Hash
} from 'lucide-react';

const Medicamentos: React.FC = () => {
  const [items, setItems] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Medicamento | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Medicamento | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    lote: '',
    validade: getLocalDateString(),
  });
  const [formError, setFormError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('medicamentos').select('*');
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,lote.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query.order('validade', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar medicamentos:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const openModal = (item: Medicamento | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ codigo: item.codigo || '', nome: item.nome, lote: item.lote, validade: item.validade });
    } else {
      setEditingItem(null);
      setFormData({ codigo: '', nome: '', lote: '', validade: getLocalDateString() });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: Medicamento) => {
    setItemToDelete(item);
    setErrorMessage(null);
    setIsDeleteModalOpen(true);
  };

  const handleNumericInput = (value: string) => {
    // Apenas aceita caracteres numéricos
    return value.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo) {
      setFormError('O campo Código é obrigatório.');
      return;
    }
    try {
      if (editingItem) {
        const { error } = await supabase.from('medicamentos').update(formData).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('medicamentos').insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError('Erro ao salvar. Verifique a conexão.');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    const id = itemToDelete.id;
    setActionLoading(id);
    setErrorMessage(null);

    try {
      const { error } = await supabase.from('medicamentos').delete().eq('id', id);
      if (error) throw error;

      // Verificação RLS ou persistência
      const { data: verify } = await supabase.from('medicamentos').select('id').eq('id', id).maybeSingle();
      if (verify) throw new Error("Ação negada pelo servidor.");

      setItems(prev => prev.filter(item => item.id !== id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao excluir.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatus = (validade: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(validade + 'T00:00:00');
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { 
      label: 'Vencido', 
      color: 'text-red-700 bg-red-100 ring-1 ring-red-200', 
      rowBg: 'bg-red-50/50',
      border: 'border-l-red-600',
      icon: AlertTriangle 
    };
    if (diffDays <= 30) return { 
      label: 'Crítico (30d)', 
      color: 'text-amber-700 bg-amber-100 ring-1 ring-amber-200', 
      rowBg: 'bg-amber-50/40',
      border: 'border-l-amber-500',
      icon: ShieldAlert 
    };
    if (diffDays <= 60) return { 
      label: 'Atenção (60d)', 
      color: 'text-orange-700 bg-orange-100 ring-1 ring-orange-200', 
      rowBg: 'bg-orange-50/20',
      border: 'border-l-orange-400',
      icon: Clock 
    };
    return { 
      label: 'Em Dia', 
      color: 'text-emerald-700 bg-emerald-100 ring-1 ring-emerald-200', 
      rowBg: '',
      border: 'border-l-transparent',
      icon: CheckCircle2 
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Estoque de Medicamentos</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestão técnica de validade e rastreabilidade</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} />
          <span>Novo Medicamento</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/30">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por Código, Nome ou Lote..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-black text-xs font-bold uppercase tracking-widest"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">Código</th>
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5">Lote</th>
                <th className="px-8 py-5">Validade</th>
                <th className="px-8 py-5">Situação</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {loading && items.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={24} /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest">Nenhum medicamento registrado</td></tr>
              ) : (
                items.map((item) => {
                  const status = getStatus(item.validade);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id} className={`${status.rowBg} ${status.border} border-l-4 transition-all duration-300 hover:bg-gray-50/50 group`}>
                      <td className="px-8 py-5 font-black text-gray-400 text-xs">#{item.codigo}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <Pill size={16} className={`group-hover:rotate-12 transition-transform ${status.color.split(' ')[0]}`} />
                          <span className="font-black text-gray-800 uppercase tracking-tight">{item.nome}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-500 uppercase">{item.lote}</td>
                      <td className="px-8 py-5 font-bold text-gray-600">{formatDate(item.validade)}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                          <StatusIcon size={12} className="shrink-0" />
                          <span>{status.label}</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="Editar"><Edit2 size={16} /></button>
                          <button onClick={() => openDeleteModal(item)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90" title="Excluir"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Deletar */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => !actionLoading && setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-scaleIn border border-white p-10 text-center">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6"><Trash2 size={32} /></div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Excluir Item?</h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8">Esta ação removerá <span className="text-gray-900">"{itemToDelete?.nome}"</span> permanentemente do banco de dados.</p>
              {errorMessage && <p className="text-[10px] text-red-600 font-black uppercase bg-red-50 p-3 rounded-xl mb-4">{errorMessage}</p>}
              <div className="flex flex-col space-y-3">
                <button onClick={confirmDelete} disabled={!!actionLoading} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2">
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Confirmar Exclusão</span>}
                </button>
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={!!actionLoading} className="w-full py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Cancelar</button>
              </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg"><Pill size={20} /></div>
                 <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{editingItem ? 'Editar' : 'Novo'} Medicamento</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Código Identificador *</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="Somente números"
                    value={formData.codigo} 
                    onChange={(e) => setFormData({...formData, codigo: handleNumericInput(e.target.value)})} 
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none font-black text-xs text-blue-600 tracking-widest" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome do Medicamento *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Amoxicilina 500mg"
                  value={formData.nome} 
                  onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none font-black text-xs uppercase" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lote *</label>
                  <input 
                    type="text" 
                    placeholder="ABC123"
                    value={formData.lote} 
                    onChange={(e) => setFormData({...formData, lote: e.target.value.toUpperCase()})} 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none font-black text-xs uppercase" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Validade *</label>
                  <input 
                    type="date" 
                    value={formData.validade} 
                    onChange={(e) => setFormData({...formData, validade: e.target.value})} 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none font-black text-xs" 
                    required 
                  />
                </div>
              </div>
              {formError && <div className="text-red-600 text-[10px] font-black uppercase text-center bg-red-50 p-3 rounded-xl">{formError}</div>}
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicamentos;
