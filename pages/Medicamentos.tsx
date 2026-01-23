
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
  ShieldAlert
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
        query = query.or(`nome.ilike.%${searchTerm}%,lote.ilike.%${searchTerm}%`);
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
      setFormData({ nome: item.nome, lote: item.lote, validade: item.validade });
    } else {
      setEditingItem(null);
      setFormData({ nome: '', lote: '', validade: getLocalDateString() });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: Medicamento) => {
    setItemToDelete(item);
    setErrorMessage(null);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Verificação RLS
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
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Estoque de Medicamentos</h1>
          <p className="text-gray-500 text-sm">Controle rigoroso de lotes e vencimentos.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 font-bold text-sm"
        >
          <Plus size={20} />
          <span>Cadastrar Novo</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou lote..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600/50 transition-all text-black text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 text-gray-400 text-[10px] uppercase tracking-widest font-black border-b">
              <tr>
                <th className="px-6 py-5">Medicamento</th>
                <th className="px-6 py-5">Lote</th>
                <th className="px-6 py-5">Validade</th>
                <th className="px-6 py-5">Situação</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {loading && items.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-[10px]">Estoque Vazio</td></tr>
              ) : (
                items.map((item) => {
                  const status = getStatus(item.validade);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id} className={`${status.rowBg} ${status.border} border-l-4 transition-all duration-300 hover:brightness-95`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <Pill size={16} className={status.color.split(' ')[0]} />
                          <span className="font-bold text-gray-800">{item.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-gray-500">{item.lote}</td>
                      <td className="px-6 py-5 font-bold text-gray-600">{formatDate(item.validade)}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${status.color}`}>
                          <StatusIcon size={12} className="shrink-0" />
                          <span>{status.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all active:scale-90" title="Editar"><Edit2 size={16} /></button>
                          <button onClick={() => openDeleteModal(item)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all active:scale-90" title="Excluir"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-scaleIn border border-white p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2"><Trash2 size={32} /></div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Excluir Item?</h3>
              <p className="text-gray-500 text-sm">Esta ação removerá <span className="font-bold">"{itemToDelete?.nome}"</span> permanentemente do estoque.</p>
              {errorMessage && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg">{errorMessage}</p>}
              <div className="flex flex-col space-y-3 pt-4">
                <button onClick={confirmDelete} disabled={!!actionLoading} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2">
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Confirmar</span>}
                </button>
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={!!actionLoading} className="w-full py-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
              </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 uppercase tracking-tighter">{editingItem ? 'Editar' : 'Novo'} Medicamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-600/50 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lote</label>
                  <input type="text" value={formData.lote} onChange={(e) => setFormData({...formData, lote: e.target.value.toUpperCase()})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-600/50 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Validade</label>
                  <input type="date" value={formData.validade} onChange={(e) => setFormData({...formData, validade: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-600/50 outline-none" required />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicamentos;
