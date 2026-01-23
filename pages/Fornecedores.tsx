
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Fornecedor } from '../types';
import { maskDocument, maskPhone } from '../utils';
import { Plus, Edit2, Search, X, Loader2 } from 'lucide-react';
import Pagination from '../Pagination';

const Fornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 8;
  
  // Form state
  const [formData, setFormData] = useState({
    razao_social: '',
    documento: '',
    telefone: '',
    email: ''
  });
  const [formError, setFormError] = useState('');

  const fetchFornecedores = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    try {
      let query = supabase
        .from('fornecedores')
        .select('id, razao_social, documento, telefone, email, created_at', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`razao_social.ilike.%${searchTerm}%,documento.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query
        .order('razao_social', { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      
      setFornecedores(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFornecedores();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchFornecedores]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openModal = (f: Fornecedor | null = null) => {
    if (f) {
      setEditingFornecedor(f);
      setFormData({
        razao_social: f.razao_social,
        documento: f.documento,
        telefone: f.telefone,
        email: f.email
      });
    } else {
      setEditingFornecedor(null);
      setFormData({ razao_social: '', documento: '', telefone: '', email: '' });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, documento: maskDocument(e.target.value) });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, telefone: maskPhone(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razao_social || !formData.documento) {
      setFormError('Razão Social e Documento são obrigatórios.');
      return;
    }

    try {
      if (editingFornecedor) {
        const { error } = await supabase
          .from('fornecedores')
          .update(formData)
          .eq('id', editingFornecedor.id);
        if (error) throw error;
      } else {
        const { data: existing } = await supabase
          .from('fornecedores')
          .select('id')
          .eq('documento', formData.documento)
          .maybeSingle();

        if (existing) {
          setFormError('Fornecedor com este documento já cadastrado.');
          return;
        }

        const { error } = await supabase
          .from('fornecedores')
          .insert([formData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchFornecedores();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar fornecedor.');
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Fornecedores</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de parceiros comerciais cadastrados</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por razão social ou CPF/CNPJ..." 
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
                <th className="px-8 py-4">Razão Social</th>
                <th className="px-8 py-4">Documento</th>
                <th className="px-8 py-4">Telefone</th>
                <th className="px-8 py-4">E-mail</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <Loader2 className="animate-spin text-blue-600" size={24} />
                       <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                    </div>
                  </td>
                </tr>
              ) : fornecedores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400 uppercase text-[10px] font-bold">Nenhum fornecedor encontrado.</td>
                </tr>
              ) : (
                fornecedores.map((f) => (
                  <tr key={f.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-4 font-black text-gray-800 uppercase tracking-tight">{f.razao_social}</td>
                    <td className="px-8 py-4 text-gray-500 font-bold">{f.documento}</td>
                    <td className="px-8 py-4 text-gray-500 font-bold">{f.telefone}</td>
                    <td className="px-8 py-4 text-gray-400 font-medium">{f.email || '-'}</td>
                    <td className="px-8 py-4 text-center">
                      <button 
                        onClick={() => openModal(f)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Exibindo <span className="text-blue-600">{fornecedores.length}</span> de <span className="text-blue-600">{totalCount}</span> registros
          </p>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            isLoading={loading}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Razão Social *</label>
                <input 
                  type="text" 
                  value={formData.razao_social}
                  onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">CPF ou CNPJ *</label>
                <input 
                  type="text" 
                  value={formData.documento}
                  onChange={handleDocumentChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefone</label>
                  <input 
                    type="text" 
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs"
                  />
                </div>
              </div>
              {formError && <p className="text-red-600 text-[10px] font-black uppercase text-center">{formError}</p>}
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[11px] active:scale-95"
                >
                  {editingFornecedor ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fornecedores;
