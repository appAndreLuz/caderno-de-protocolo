
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Emprestimo } from '../types';
import { formatDate, getLocalDateString } from '../utils';
import { 
  Plus, 
  Search, 
  X, 
  Handshake, 
  Loader2, 
  Printer, 
  FileDown, 
  Eye, 
  FileText,
  BookOpen
} from 'lucide-react';

declare var html2pdf: any;

const Emprestimos: React.FC = () => {
  const [items, setItems] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [nextSeq, setNextSeq] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    fornecedor_nome: '',
    item_nome: '',
    data_emprestimo: getLocalDateString(),
    observacoes: ''
  });
  const [formError, setFormError] = useState('');

  const fetchEmprestimos = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('emprestimos').select('*');
      
      if (searchTerm) {
        query = query.or(`fornecedor_nome.ilike.%${searchTerm}%,item_nome.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('numero_sequencial', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
      
      const { data: lastItem } = await supabase
        .from('emprestimos')
        .select('numero_sequencial')
        .order('numero_sequencial', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setNextSeq((lastItem?.numero_sequencial || 0) + 1);
    } catch (err) {
      console.error('Erro ao buscar empréstimos:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEmprestimos();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchEmprestimos]);

  const openModal = () => {
    setFormData({
      fornecedor_nome: '',
      item_nome: '',
      data_emprestimo: getLocalDateString(),
      observacoes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const formatProtocol = (seq: number) => {
    const year = new Date().getFullYear();
    return `Protocolo de Empréstimo #${String(seq).padStart(3, '0')}/${year}`;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fornecedor_nome || !formData.item_nome || !formData.data_emprestimo) {
      setFormError('Preencha os campos obrigatórios (*).');
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        numero_sequencial: nextSeq,
        fornecedor_nome: formData.fornecedor_nome,
        item_nome: formData.item_nome,
        data_emprestimo: formData.data_emprestimo,
        observacoes: formData.observacoes
      };

      const { error } = await supabase.from('emprestimos').insert([payload]);
      
      if (error) {
        if (error.code === '23505') throw new Error("Conflito de numeração de protocolo.");
        throw error;
      }

      setIsPreviewOpen(false);
      setIsModalOpen(false);
      fetchEmprestimos();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao gravar registro.');
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('termo-document');
    if (!element) return;

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `Termo_Emprestimo_${nextSeq}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
    handleSubmit();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Empréstimos</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestão de termos e comodatos</p>
        </div>
        <button 
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} />
          <span>Criar Novo Termo</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por destinatário ou item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all text-black text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-4">Protocolo</th>
                <th className="px-8 py-4">Destinatário</th>
                <th className="px-8 py-4">Item/Equipamento</th>
                <th className="px-8 py-4">Data Emissão</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400 uppercase text-[10px] font-bold">Nenhum termo registrado.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-4 font-black text-gray-900 tracking-tighter uppercase">Termo #{item.numero_sequencial}</td>
                    <td className="px-8 py-4 text-gray-800 uppercase font-black">{item.fornecedor_nome}</td>
                    <td className="px-8 py-4 text-gray-500 font-bold">{item.item_nome}</td>
                    <td className="px-8 py-4 font-bold text-gray-400">{formatDate(item.data_emprestimo)}</td>
                    <td className="px-8 py-4 text-center">
                       <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Ativo</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Novo Termo de Empréstimo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePreview} className="p-8 space-y-5">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Protocolo Sequencial</label>
                <input 
                  type="text" 
                  value={formatProtocol(nextSeq)}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 font-black text-xs uppercase"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destinatário *</label>
                <input 
                  type="text" 
                  placeholder="Nome da Instituição ou Pessoa"
                  value={formData.fornecedor_nome}
                  onChange={(e) => setFormData({...formData, fornecedor_nome: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Item para Empréstimo *</label>
                <input 
                  type="text" 
                  placeholder="Ex: 05 unid. de Papel Termossensível"
                  value={formData.item_nome}
                  onChange={(e) => setFormData({...formData, item_nome: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Data de Emissão *</label>
                <input 
                  type="date" 
                  value={formData.data_emprestimo}
                  onChange={(e) => setFormData({...formData, data_emprestimo: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Observações</label>
                <textarea 
                  value={formData.observacoes}
                  placeholder="Instruções ou restrições..."
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl h-24 resize-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none text-black text-xs font-bold uppercase"
                />
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
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[11px] active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Eye size={16} />
                  <span>Ver Documento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-scaleIn flex flex-col h-[85vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Pré-visualização</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-gray-100">
               <div id="termo-document" className="bg-white p-12 shadow-sm rounded-lg min-h-full font-sans">
                  <div className="flex justify-center mb-10">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl">
                       <Handshake size={32} />
                    </div>
                  </div>
                  
                  <div className="text-center mb-10">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Termo de Empréstimo</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{formatProtocol(nextSeq)}</p>
                  </div>

                  <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                    <p>
                      Pelo presente instrumento, o **Almoxarifado Central** formaliza o empréstimo do item/equipamento: 
                      <span className="font-black text-gray-900 uppercase ml-1 underline">"{formData.item_nome}"</span>.
                    </p>
                    <p>
                      O item mencionado acima foi retirado por/para: 
                      <span className="font-black text-gray-900 uppercase ml-1">"{formData.fornecedor_nome}"</span>, 
                      ficando sob sua inteira responsabilidade até a devolução formal.
                    </p>
                    
                    {formData.observacoes && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                        <span className="font-black uppercase text-[10px] text-gray-400 block mb-1">Notas:</span>
                        {formData.observacoes}
                      </div>
                    )}

                    <div className="pt-12 grid grid-cols-2 gap-12">
                      <div className="border-t border-gray-200 pt-2 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Responsável p/ Retirada</p>
                      </div>
                      <div className="border-t border-gray-200 pt-2 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gerência de Almoxarifado</p>
                      </div>
                    </div>

                    <div className="pt-8 text-center text-[10px] text-gray-300 font-black uppercase tracking-widest">
                       Data de Emissão: {formatDate(formData.data_emprestimo)}
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex space-x-4">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900"
              >
                Voltar e Corrigir
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Printer size={18} />
                <span>Salvar e Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emprestimos;
