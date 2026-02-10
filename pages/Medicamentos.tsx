
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
  Loader2,
  Trash2,
  Hash,
  Copy,
  AlertCircle,
  Terminal,
  Database,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Box,
  CalendarDays,
  AlertTriangle
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
  const [dbConstraintError, setDbConstraintError] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    lote: '',
    validade: getLocalDateString(),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('medicamentos').select('*');
      
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,lote.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
      }
      
      // ALTERAÇÃO CRÍTICA: Ordenação por data de validade (ascendente = mais próximo primeiro)
      const { data, error } = await query.order('validade', { ascending: true });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar:', err);
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

  const openModal = (item: Medicamento | null = null, isClone = false) => {
    setDbConstraintError(false);
    setFormError('');
    if (item) {
      setEditingItem(isClone ? null : item);
      setFormData({ 
        codigo: item.codigo || '', 
        nome: item.nome, 
        lote: isClone ? '' : item.lote, 
        validade: isClone ? getLocalDateString() : item.validade 
      });
    } else {
      setEditingItem(null);
      setFormData({ codigo: '', nome: '', lote: '', validade: getLocalDateString() });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setDbConstraintError(false);

    try {
      const payload = {
        codigo: formData.codigo.trim(),
        nome: formData.nome.toUpperCase(),
        lote: formData.lote.toUpperCase(),
        validade: formData.validade
      };

      if (editingItem) {
        const { error } = await supabase.from('medicamentos').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('medicamentos').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err.code === '23505') {
        setDbConstraintError(true);
      } else {
        setFormError(err.message || 'Falha no servidor. Tente novamente.');
      }
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(itemToDelete.id);
    try {
      const { error } = await supabase.from('medicamentos').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert('Erro na exclusão.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (validade: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(validade + 'T00:00:00');
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 bg-red-50 border-red-100 ring-2 ring-red-500/10';
    if (diffDays <= 30) return 'text-amber-600 bg-amber-50 border-amber-100 ring-2 ring-amber-500/10';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/10';
  };

  const advancedSql = `DO $$ 
DECLARE 
    const_name TEXT;
BEGIN
    SELECT tc.constraint_name INTO const_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = 'medicamentos' AND kcu.column_name = 'codigo';
    
    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE medicamentos DROP CONSTRAINT ' || quote_ident(const_name);
    END IF;
END $$;`;

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Header Corporativo */}
      <div className="relative group overflow-hidden bg-white p-8 rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        
        <div className="flex items-center space-x-6 relative z-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[1.8rem] text-white shadow-2xl shadow-blue-500/30 transform transition-transform group-hover:scale-105">
            <Box size={32} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Almoxarifado</h1>
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                <CalendarDays size={12} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Ordenado p/ Validade</span>
              </div>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">Prioridade de saída por data de vencimento</p>
          </div>
        </div>

        <button 
          onClick={() => openModal()}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Cadastrar Novo Lote</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white/60 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="LOCALIZAR POR CÓDIGO, DESCRIÇÃO OU LOTE..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[1.8rem] focus:outline-none focus:ring-[12px] focus:ring-blue-600/5 transition-all text-black text-xs font-black uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Tabela de Inventário */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cód / Loc</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Almoxarifado</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lote</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data Vencimento</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={40} strokeWidth={1} />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mt-6">Ajustando ordem de vencimento...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <LayoutGrid size={32} className="text-gray-200" />
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Nenhum item em estoque</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest inline-flex items-center space-x-2 border border-gray-200 shadow-sm">
                        <Hash size={12} className="opacity-40" />
                        <span>{item.codigo}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="font-black text-gray-900 uppercase text-[12px] tracking-tight">{item.nome}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="font-bold text-gray-400 uppercase text-[11px] tracking-widest">#{item.lote}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(item.validade)}`}>
                        {formatDate(item.validade)}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal(item, true)} className="p-3 text-emerald-600 hover:bg-emerald-100 rounded-[1.2rem] transition-all" title="Cadastrar novo lote deste item"><Copy size={16} /></button>
                        <button onClick={() => openModal(item)} className="p-3 text-blue-600 hover:bg-blue-100 rounded-[1.2rem] transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }} className="p-3 text-red-500 hover:bg-red-100 rounded-[1.2rem] transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md z-10 overflow-hidden animate-scaleIn border border-white">
            <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20"><Pill size={24} /></div>
                 <div>
                   <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">{editingItem ? 'Editar' : 'Novo'} Lote</h3>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Almoxarifado Digital</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-900"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {dbConstraintError ? (
                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 animate-fadeIn">
                   <div className="flex items-center space-x-3 text-red-600 mb-6">
                      <AlertTriangle size={24} />
                      <span className="font-black text-xs uppercase tracking-tight">Regra de Unicidade Ativa</span>
                   </div>
                   <p className="text-[10px] text-red-800 font-bold leading-relaxed mb-6">
                     O banco de dados ainda impede códigos repetidos. Execute este script no **SQL Editor** do Supabase para destravar agora:
                   </p>
                   <div className="bg-gray-900 p-5 rounded-2xl relative group font-mono">
                      <code className="text-emerald-400 text-[8px] block leading-relaxed whitespace-pre-wrap">
                        {advancedSql}
                      </code>
                      <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText(advancedSql)}
                        className="absolute right-3 top-3 p-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                        title="Copiar Script"
                      >
                        <Terminal size={14} />
                      </button>
                   </div>
                   <div className="mt-6 flex items-center justify-center text-red-600 space-x-2 animate-pulse">
                      <ArrowRight size={14} />
                      <span className="text-[9px] font-black uppercase text-center">Execute o SQL e salve novamente</span>
                   </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Identificador / Cód *</label>
                    <input 
                      type="text" 
                      placeholder="EX: PRATELEIRA-01 OU EAN"
                      value={formData.codigo} 
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})} 
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600/30 outline-none font-black text-xs text-blue-600 tracking-widest transition-all" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nome do Insumo *</label>
                    <input 
                      type="text" 
                      placeholder="EX: SORO FISIOLÓGICO 500ML"
                      value={formData.nome} 
                      onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600/30 outline-none font-black text-xs uppercase transition-all" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Lote *</label>
                      <input 
                        type="text" 
                        placeholder="LOT-X"
                        value={formData.lote} 
                        onChange={(e) => setFormData({...formData, lote: e.target.value})} 
                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600/30 outline-none font-black text-xs uppercase" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Vencimento *</label>
                      <input 
                        type="date" 
                        value={formData.validade} 
                        onChange={(e) => setFormData({...formData, validade: e.target.value})} 
                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600/30 outline-none font-black text-xs" 
                        required 
                      />
                    </div>
                  </div>
                  {formError && <div className="text-red-600 text-[10px] font-black uppercase text-center bg-red-50 p-4 rounded-2xl border border-red-100">{formError}</div>}
                </>
              )}

              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Cancelar</button>
                {!dbConstraintError && (
                  <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
                    Registrar Item
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerta de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => !actionLoading && setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-scaleIn border border-white p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 shadow-inner"><Trash2 size={40} strokeWidth={2.5} /></div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Excluir Lote?</h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-10 uppercase tracking-widest">
                Você está prestes a remover o registro do lote <span className="text-gray-900">{itemToDelete?.lote}</span> do item "{itemToDelete?.nome}".
              </p>
              <div className="flex flex-col space-y-4">
                <button onClick={confirmDelete} disabled={!!actionLoading} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-red-500/30 active:scale-95 disabled:opacity-50">
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Confirmar Remoção"}
                </button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-5 text-gray-400 font-black uppercase tracking-widest text-[10px]">Manter no Estoque</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicamentos;
