
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { NAF, Fornecedor } from '../types';
import { calculateNafPage, formatCurrency, formatDate, maskCurrency, parseCurrency, getLocalDateString } from '../utils';
import { Plus, Edit2, Search, X, BookOpen, Loader2, Eye, FileText } from 'lucide-react';
import Pagination from '../Pagination';

const Nafs: React.FC = () => {
  const [nafs, setNafs] = useState<NAF[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingNaf, setEditingNaf] = useState<NAF | null>(null);
  const [viewingNaf, setViewingNaf] = useState<NAF | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0); 
  const [filteredCount, setFilteredCount] = useState(0); 
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    data_entrada: getLocalDateString(),
    numero_naf: '',
    numero_subnaf: '',
    fornecedor_id: '',
    valor: '',
    observacao: ''
  });
  const [formError, setFormError] = useState('');

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('fornecedores').select('id, razao_social, documento').order('razao_social');
    setFornecedores(data || []);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    try {
      const { count: absCount } = await supabase.from('nafs').select('id', { count: 'exact', head: true });
      setTotalCount(absCount || 0);

      let query = supabase
        .from('nafs')
        .select('id, created_at, data_entrada, numero_naf, numero_subnaf, valor, data_baixa, fornecedor_id, observacao, fornecedor:fornecedores(razao_social)', { count: 'exact' });

      if (searchTerm) {
        if (/^\d+$/.test(searchTerm)) {
           query = query.ilike('numero_naf', `%${searchTerm}%`);
        } else {
           query = query.ilike('fornecedor.razao_social', `%${searchTerm}%`);
        }
      }

      // LÓGICA DE FILA: Novos registros ficam abaixo (Ordem Ascendente por criação)
      const { data, count, error } = await query
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;

      setNafs(data || []);
      setFilteredCount(count || 0);
    } catch (err) {
      console.error('Erro ao buscar NAFs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openModal = (n: NAF | null = null) => {
    if (n) {
      setEditingNaf(n);
      setFormData({
        data_entrada: n.data_entrada,
        numero_naf: n.numero_naf,
        numero_subnaf: n.numero_subnaf,
        fornecedor_id: n.fornecedor_id,
        valor: maskCurrency(n.valor.toString().replace('.', '')),
        observacao: n.observacao || ''
      });
    } else {
      setEditingNaf(null);
      setFormData({
        data_entrada: getLocalDateString(),
        numero_naf: '',
        numero_subnaf: '',
        fornecedor_id: '',
        valor: '',
        observacao: ''
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const openViewModal = (n: NAF) => {
    setViewingNaf(n);
    setIsViewModalOpen(true);
  };

  const handleNumericInput = (field: string, value: string, max: number) => {
    const clean = value.replace(/\D/g, '').substring(0, max);
    setFormData({ ...formData, [field]: clean });
  };

  const handleCurrencyInput = (value: string) => {
    setFormData({ ...formData, valor: maskCurrency(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data_entrada, numero_naf, numero_subnaf, fornecedor_id, valor } = formData;
    
    if (!data_entrada || !numero_naf || !numero_subnaf || !fornecedor_id || !valor) {
      setFormError('Todos os campos obrigatórios (*) devem ser preenchidos.');
      return;
    }

    try {
      const payload = {
        data_entrada,
        numero_naf,
        numero_subnaf,
        fornecedor_id,
        valor: parseCurrency(valor),
        observacao: formData.observacao
      };

      if (editingNaf) {
        const { error } = await supabase.from('nafs').update(payload).eq('id', editingNaf.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('nafs').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Database error:', err);
      setFormError('Não foi possível gravar os dados.');
    }
  };

  const totalPages = Math.ceil(filteredCount / itemsPerPage);
  const nextPageNum = calculateNafPage(totalCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Protocolos NAF</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Registro oficial de entradas (Fila Cronológica)</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Página de Destino</span>
            <div className="flex items-center text-blue-600 font-black text-xl leading-none">
              <BookOpen size={18} className="mr-2" />
              #{nextPageNum}
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs font-black uppercase tracking-widest"
          >
            <Plus size={18} />
            <span>Nova NAF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por NAF ou Fornecedor..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all text-black text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-4">Data Entrada</th>
                <th className="px-8 py-4">NAF / SUB</th>
                <th className="px-8 py-4">Fornecedor</th>
                <th className="px-8 py-4">Valor</th>
                <th className="px-8 py-4 text-center">Situação</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : nafs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-gray-400 uppercase text-[10px] font-bold">Nenhum registro.</td>
                </tr>
              ) : (
                nafs.map((n) => (
                  <tr key={n.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-4 text-gray-500 font-bold">{formatDate(n.data_entrada)}</td>
                    <td className="px-8 py-4 font-black text-gray-900 tracking-tighter">{n.numero_naf} <span className="text-gray-300">/</span> {n.numero_subnaf}</td>
                    <td className="px-8 py-4 text-gray-800 uppercase tracking-tight font-black">{n.fornecedor?.razao_social}</td>
                    <td className="px-8 py-4 font-black text-blue-600">{formatCurrency(n.valor)}</td>
                    <td className="px-8 py-4 text-center">
                      {n.data_baixa ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Baixada</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Pendente</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => openViewModal(n)} className="p-2 text-gray-400 hover:text-blue-600 transition-all active:scale-90"><Eye size={16} /></button>
                        <button onClick={() => openModal(n)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"><Edit2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Exibindo página <span className="text-blue-600">{currentPage}</span> de <span className="text-blue-600">{totalPages}</span>
          </p>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            isLoading={loading}
          />
        </div>
      </div>

      {isViewModalOpen && viewingNaf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-600" size={24} />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Dossiê NAF</h3>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Entrada</label>
                  <p className="font-black text-gray-800">{formatDate(viewingNaf.data_entrada)}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Identificador</label>
                  <p className="font-black text-blue-600 text-lg tracking-tighter">#{viewingNaf.numero_naf} / {viewingNaf.numero_subnaf}</p>
                </div>
              </div>
              <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Notas e Observações</label>
                <p className="text-xs italic text-gray-600 leading-relaxed">"{viewingNaf.observacao || 'Nenhum detalhe adicional registrado.'}"</p>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Fechar Dossiê</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-scaleIn text-sm">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{editingNaf ? 'Editar NAF' : 'Nova NAF'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-5">
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Data Entrada *</label>
                <input type="date" value={formData.data_entrada} onChange={(e) => setFormData({...formData, data_entrada: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase" required />
              </div>
              <div className="col-span-1 flex space-x-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">NAF *</label>
                  <input type="text" placeholder="000000" value={formData.numero_naf} onChange={(e) => handleNumericInput('numero_naf', e.target.value, 6)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase" required />
                </div>
                <div className="w-20">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">SUB *</label>
                  <input type="text" placeholder="00" value={formData.numero_subnaf} onChange={(e) => handleNumericInput('numero_subnaf', e.target.value, 2)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-center text-black font-bold text-xs uppercase" required />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fornecedor *</label>
                <select value={formData.fornecedor_id} onChange={(e) => setFormData({...formData, fornecedor_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase" required>
                  <option value="">Selecione...</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Valor Unitário *</label>
                <input type="text" placeholder="R$ 0,00" value={formData.valor} onChange={(e) => handleCurrencyInput(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase" required />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Observação</label>
                <textarea value={formData.observacao} onChange={(e) => setFormData({...formData, observacao: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl h-24 resize-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none text-black font-bold text-xs uppercase" />
              </div>
              {formError && <div className="col-span-2 text-red-600 text-[10px] font-black uppercase text-center bg-red-50 p-3 rounded-xl">{formError}</div>}
              <div className="col-span-2 flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Gravar NAF</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nafs;
