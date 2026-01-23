
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
  FileText 
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
      
      // Calculate next sequence
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
    return `Termo de Empréstimo ${String(seq).padStart(2, '0')}/2026`;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fornecedor_nome || !formData.item_nome || !formData.data_emprestimo) {
      setFormError('Preencha todos os campos obrigatórios.');
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
        if (error.code === '23505') throw new Error("Número de protocolo duplicado.");
        throw error;
      }

      setIsPreviewOpen(false);
      setIsModalOpen(false);
      fetchEmprestimos();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao gravar empréstimo.');
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('termo-document');
    if (!element) return;

    const opt = {
      margin: 15,
      filename: `Termo_Emprestimo_${nextSeq}_2026.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
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
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de termos e comodatos de equipamentos</p>
        </div>
        <button 
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} />
          <span>Novo Termo</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por fornecedor ou item..." 
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
                <th className="px-8 py-4">Beneficiário</th>
                <th className="px-8 py-4">Item</th>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4 text-center">Status</th>
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
                    <td className="px-8 py-4 font-black text-gray-900 tracking-tighter uppercase">{formatProtocol(item.numero_sequencial)}</td>
                    <td className="px-8 py-4 text-gray-800 uppercase font-black">{item.fornecedor_nome}</td>
                    <td className="px-8 py-4 text-gray-500 font-bold">{item.item_nome}</td>
                    <td className="px-8 py-4 font-bold text-gray-400">{formatDate(item.data_emprestimo)}</td>
                    <td className="px-8 py-4 text-center">
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Emitido</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro */}
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
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Número do Protocolo</label>
                <input 
                  type="text" 
                  value={formatProtocol(nextSeq)}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 font-black text-xs uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fornecedor Beneficiado *</label>
                <input 
                  type="text" 
                  value={formData.fornecedor_nome}
                  onChange={(e) => setFormData({...formData, fornecedor_nome: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Item Emprestado *</label>
                <input 
                  type="text" 
                  value={formData.item_nome}
                  onChange={(e) => setFormData({...formData, item_nome: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Data do Empréstimo *</label>
                <input 
                  type="date" 
                  value={formData.data_emprestimo}
                  onChange={(e) => setFormData({...formData, data_emprestimo: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:outline-none text-black font-bold text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Observações Adicionais</label>
                <textarea 
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl h-24 resize-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none text-black text-xs italic"
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
                  <span>Visualizar Termo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Termo */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-scaleIn flex flex-col h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Visualização do Termo</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
               <div id="termo-document" className="bg-white text-black font-serif leading-loose text-justify p-8 border border-gray-100">
                  <div className="text-center mb-12">
                     <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">TERMO DE EMPRÉSTIMO</h2>
                     <p className="text-sm font-bold">{formatProtocol(nextSeq)}</p>
                  </div>
                  
                  <div className="space-y-8 text-lg">
                    <p>
                      Pelo presente termo, declaro que o item <span className="font-black italic">"{formData.item_nome}"</span> foi emprestado ao fornecedor <span className="font-black uppercase">"{formData.fornecedor_nome}"</span>, na data de <span className="font-black underline">{formatDate(formData.data_emprestimo)}</span>, ficando este responsável pela guarda, uso e devolução do referido item, nas condições acordadas entre as partes.
                    </p>

                    {formData.observacoes && (
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 font-sans text-sm italic">
                        <span className="font-black uppercase not-italic block mb-2 text-gray-400 text-[10px] tracking-widest">Observações Adicionais:</span>
                        {formData.observacoes}
                      </div>
                    )}

                    <div className="mt-20 pt-10 space-y-16">
                      <p className="text-center">Local e data: ___________________________, {formatDate(formData.data_emprestimo)}</p>
                      
                      <div className="flex flex-col items-center pt-10">
                        <div className="w-80 h-[1px] bg-gray-900 mb-2"></div>
                        <p className="text-sm font-bold uppercase tracking-widest">Assinatura do responsável pelo empréstimo</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-gray-50 border-t shrink-0 flex space-x-4">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900"
              >
                Voltar e Editar
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Printer size={18} />
                <span>Emitir e Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emprestimos;
