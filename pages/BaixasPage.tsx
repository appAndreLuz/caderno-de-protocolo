
import React, { useState } from 'react';
import { Search, ArrowDownCircle, CheckCircle2, AlertCircle, Loader2, FileText, User, Calendar, DollarSign, BookOpen, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAF } from '../types';
import { nafService } from '../services/nafService';
import { formatDate, getLocalDateISO } from '../utils/dateUtils';

const BaixasPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<NAF[]>([]);
  const [foundNaf, setFoundNaf] = useState<NAF | null>(null);
  const [status, setStatus] = useState<'idle' | 'not-found' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setStatus('idle');
    setFoundNaf(null);
    setResults([]);
    setMsg('');

    try {
      const data = await nafService.findByNumber(searchTerm);
      if (data && data.length > 0) {
        setResults(data);
        if (data.length === 1) {
          setFoundNaf(data[0]);
        }
      } else {
        setStatus('not-found');
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setStatus('error');
      setMsg("Não foi possível buscar o protocolo no momento.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!foundNaf) return;

    setIsSubmitting(true);
    setStatus('idle');
    try {
      const result = await nafService.registerWithdrawal(foundNaf.id);
      if (result.success) {
        setStatus('success');
        setMsg(result.message);
        setFoundNaf({ ...foundNaf, data_saida: getLocalDateISO() });
      } else {
        setStatus('error');
        setMsg(result.message);
      }
    } catch (err) {
      setStatus('error');
      setMsg("Falha ao registrar a baixa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const estornarBaixa = async (nafId: string) => {
    setIsSubmitting(true);
    setStatus('idle');
    try {
      const result = await nafService.revertWithdrawal(nafId);
      if (result.success) {
        setFoundNaf(prev => prev ? { ...prev, data_saida: null } : null);
        setStatus('success');
        setMsg(result.message);
        setTimeout(() => {
          setFoundNaf(null);
          setSearchTerm('');
          setStatus('idle');
          setMsg('');
        }, 2000);
      } else {
        setStatus('error');
        setMsg(result.message);
      }
    } catch (err) {
      setStatus('error');
      setMsg("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const isBaixada = !!foundNaf?.data_saida;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#02416D] tracking-tight">Baixas de NAF</h2>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <ArrowDownCircle size={16} className="text-[#AEDD2B]" />
            Gerencie o encerramento e a saída física dos protocolos.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <label className="block text-xs font-black text-[#02416D] uppercase mb-4 tracking-widest">Localizar Protocolo pelo Número</label>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
              placeholder="Digite o número da NAF..."
              className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-2xl transition-all outline-none font-bold text-lg text-[#02416D]"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-[#0A5483] text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-[#02416D] transition-all flex items-center justify-center gap-2 min-w-[160px]"
          >
            {isSearching ? <Loader2 className="animate-spin" size={24} /> : 'BUSCAR'}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {status === 'not-found' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl flex gap-4 items-center">
            <AlertCircle className="text-orange-500 shrink-0" size={32} />
            <div>
              <p className="text-orange-900 font-black text-lg">Protocolo não encontrado</p>
              <p className="text-orange-700 font-medium">Verifique o número e tente novamente.</p>
            </div>
          </motion.div>
        )}

        {results.length > 1 && !foundNaf && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-[#02416D] text-white p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} className="text-[#AEDD2B]" />
              <p className="font-bold">Múltiplos registros encontrados para o número "{searchTerm}". Selecione um abaixo:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((naf) => (
                <button
                  key={naf.id}
                  onClick={() => setFoundNaf(naf)}
                  className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-[#AEDD2B] text-left transition-all shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-gray-400 uppercase">Protocolo</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${!!naf.data_saida ? 'bg-orange-100 text-orange-600' : 'bg-[#F8F8EC] text-[#02416D]'}`}>
                      {!!naf.data_saida ? 'BAIXADA' : 'NA PASTA'}
                    </span>
                  </div>
                  <p className="text-xl font-black text-[#02416D]">NAF {naf.naf_number} / {naf.subnaf_number}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <BookOpen size={14} className="text-[#AEDD2B]" />
                    <p className="text-xs font-bold text-gray-500 uppercase">Página {naf.page_number}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-500 mt-2 uppercase truncate">{naf.suppliers?.name || 'Sem Fornecedor'}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-black text-[#0A5483]">{formatCurrency(naf.value)}</p>
                    <span className="text-[#AEDD2B] opacity-0 group-hover:opacity-100 transition-opacity font-black text-xs">SELECIONAR →</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {foundNaf && (
          <motion.div key={foundNaf.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
            <div className={`px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 ${isBaixada ? 'bg-orange-50/50' : 'bg-[#F8F8EC]'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${isBaixada ? 'bg-orange-500 text-white' : 'bg-[#AEDD2B] text-[#02416D]'}`}>
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#02416D]">NAF {foundNaf.naf_number} / {foundNaf.subnaf_number}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${isBaixada ? 'bg-orange-100 text-orange-600' : 'bg-[#02416D] text-[#AEDD2B]'}`}>
                    {isBaixada ? 'STATUS: BAIXADA' : 'STATUS: NA PASTA'}
                  </span>
                </div>
              </div>
              {results.length > 1 && (
                <button 
                  onClick={() => setFoundNaf(null)}
                  className="text-[#02416D] font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  Voltar para a lista
                </button>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Fornecedor</p>
                    <p className="font-bold text-[#0A5483] uppercase">{foundNaf.suppliers?.name || '---'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <DollarSign className="text-gray-400" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Valor</p>
                    <p className="font-black text-2xl text-[#02416D]">{formatCurrency(foundNaf.value)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <BookOpen className="text-gray-400" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Localização no Caderno</p>
                    <p className="font-bold text-[#0A5483] uppercase">Página {foundNaf.page_number}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Data de Entrada</p>
                    <p className="font-bold text-[#0A5483] uppercase">{formatDate(foundNaf.entry_date)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              {!isBaixada ? (
                <button onClick={handleWithdrawal} disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 bg-[#AEDD2B] text-[#02416D] py-6 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.01] transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowDownCircle size={28} />}
                  REGISTRAR BAIXA
                </button>
              ) : (
                <button onClick={() => estornarBaixa(foundNaf.id)} disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 bg-white text-[#0A5483] border-2 border-[#0A5483] py-6 rounded-2xl font-black text-xl hover:bg-[#0A5483] hover:text-white transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <RotateCcw size={28} />}
                  ESTORNAR BAIXA
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BaixasPage;
