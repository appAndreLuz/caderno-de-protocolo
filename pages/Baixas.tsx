
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Search, CheckCircle, Calendar, Edit2, X, Loader2, Trash2 } from 'lucide-react';

const Baixas: React.FC = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<NAF[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNaf, setSelectedNaf] = useState<NAF | null>(null);
  const [newDate, setNewDate] = useState('');

  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    
    const { data, error } = await supabase
      .from('nafs')
      .select('*, fornecedor:fornecedores(*)')
      .eq('numero_naf', term.trim())
      .order('numero_subnaf', { ascending: true });
    
    if (error) {
      console.error('Erro na busca:', error);
    } else {
      setResults(data || []);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    await executeSearch(search);
    setLoading(false);
  };

  const darBaixa = async (id: string) => {
    setActionLoading(id);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('nafs')
        .update({ data_baixa: today })
        .eq('id', id);
      
      if (error) throw error;
      
      setResults(prev => prev.map(n => n.id === id ? { ...n, data_baixa: today } : n));
    } catch (err: any) {
      alert('Erro ao registrar saída.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoverBaixa = async (id: string) => {
    if (!confirm('Deseja realmente remover a baixa deste protocolo?')) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('nafs')
        .update({ data_baixa: null })
        .eq('id', id);

      if (error) throw error;

      setResults(prev => prev.map(n => n.id === id ? { ...n, data_baixa: null } : n));
      setIsEditModalOpen(false);
      
    } catch (err: any) {
      alert('Erro ao remover a baixa: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDate = (naf: NAF) => {
    setSelectedNaf(naf);
    setNewDate(naf.data_baixa?.split('T')[0] || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateDate = async () => {
    if (!selectedNaf || !newDate) return;

    try {
      const { error } = await supabase
        .from('nafs')
        .update({ data_baixa: newDate })
        .eq('id', selectedNaf.id);
      
      if (error) throw error;
      
      setResults(prev => prev.map(n => n.id === selectedNaf.id ? { ...n, data_baixa: newDate } : n));
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert('Erro ao atualizar data.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Dar Baixa (Saída)</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de protocolos em pasta e registros de entrega</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl">
        <div className="flex space-x-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Digite o número da NAF..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-black text-xs font-black uppercase tracking-widest shadow-sm"
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Search size={16} className="mr-2" />}
            Buscar
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {results.length === 0 && !loading && search && (
          <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Nenhuma NAF encontrada para o número informado.
          </div>
        )}

        {results.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 transition-all animate-scaleIn">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl font-black text-gray-900 tracking-tighter">{n.numero_naf}</span>
                <span className="text-gray-200 text-xl font-light">/</span>
                <span className="text-xl font-black text-gray-300 tracking-tighter">{n.numero_subnaf}</span>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                  n.data_baixa ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {n.data_baixa ? '✓ Baixada' : '• Na Pasta'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fornecedor</p>
                  <p className="font-black text-gray-800 uppercase text-xs tracking-tight truncate">{n.fornecedor?.razao_social}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Entrada</p>
                  <p className="font-bold text-gray-500 text-xs">{formatDate(n.data_entrada)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor</p>
                  <p className="font-black text-blue-600 text-xs">{formatCurrency(n.valor)}</p>
                </div>
                {n.data_baixa && (
                  <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Saída em</p>
                    <p className="font-black text-blue-600 text-xs">{formatDate(n.data_baixa)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
              {!n.data_baixa ? (
                <button 
                  onClick={() => darBaixa(n.id)}
                  disabled={actionLoading === n.id}
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center"
                >
                  {actionLoading === n.id ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle size={14} className="mr-2" />}
                  <span>Registrar Saída</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => openEditDate(n)}
                    className="p-3 bg-gray-50 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100 active:scale-90"
                    title="Alterar Data"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleRemoverBaixa(n.id)}
                    disabled={actionLoading === n.id}
                    className="bg-red-50 text-red-600 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 border border-red-100 flex items-center"
                  >
                    {actionLoading === n.id ? <Loader2 className="animate-spin mr-2" size={14} /> : <Trash2 size={14} className="mr-2" />}
                    <span>Remover Baixa</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Data de Saída</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nova Data</label>
                <input 
                  type="date" 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:outline-none text-black font-bold text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateDate}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Salvar Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Baixas;
