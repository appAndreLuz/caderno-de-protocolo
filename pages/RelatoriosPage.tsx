
import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Loader2, Download, Search, X, Check, Archive, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { supplierService } from '../services/supplierService';
import { nafService } from '../services/nafService';
import { medicineService } from '../services/medicineService';
import { Supplier, NAF, Medicine } from '../types';
import SupplierReportPDF from '../components/Relatorios/SupplierReportPDF';
import NafsInFolderReportPDF from '../components/Relatorios/NafsInFolderReportPDF';
import MedicineExpiryReportPDF from '../components/Relatorios/MedicineExpiryReportPDF';

const RelatoriosPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<'fornecedor' | 'nafs_pasta' | 'vencimento' | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    if (isModalOpen && selectedReport === 'fornecedor') {
      loadSuppliers();
    }
  }, [isModalOpen, selectedReport]);

  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const data = await supplierService.list();
      setSuppliers(data);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.document.includes(searchTerm)
  );

  const handleOpenReport = (type: 'fornecedor' | 'nafs_pasta' | 'vencimento') => {
    setSelectedReport(type);
    if (type === 'nafs_pasta') {
      generateNafsInFolderReport();
    } else if (type === 'vencimento') {
      generateMedicineExpiryReport();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (isGenerating) return; // Prevent closing while generating
    setIsModalOpen(false);
    setSelectedReport(null);
    setSelectedSupplier(null);
    setSearchTerm('');
    setGenerationProgress(0);
  };

  const generateMedicineExpiryReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);
    setIsModalOpen(true);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 5;
        });
      }, 150);

      const medicines = await medicineService.listExpiringSoon(60);
      
      setGenerationProgress(90);
      const doc = <MedicineExpiryReportPDF medicines={medicines} />;
      const blob = await pdf(doc).toBlob();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      const url = URL.createObjectURL(blob);
      
      setTimeout(() => {
        window.open(url, '_blank');
        setIsGenerating(false);
        setGenerationProgress(0);
        setIsModalOpen(false);
        setSelectedReport(null);
      }, 500);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o relatório. Tente novamente.");
      setIsGenerating(false);
      setGenerationProgress(0);
      setIsModalOpen(false);
      setSelectedReport(null);
    }
  };

  const generateNafsInFolderReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);
    setIsModalOpen(true); // Open modal to show progress

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 5;
        });
      }, 150);

      const nafs = await nafService.listInFolder();
      
      setGenerationProgress(90);
      const doc = <NafsInFolderReportPDF nafs={nafs} />;
      const blob = await pdf(doc).toBlob();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      const url = URL.createObjectURL(blob);
      
      setTimeout(() => {
        window.open(url, '_blank');
        setIsGenerating(false);
        setGenerationProgress(0);
        setIsModalOpen(false);
        setSelectedReport(null);
      }, 500);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o relatório. Tente novamente.");
      setIsGenerating(false);
      setGenerationProgress(0);
      setIsModalOpen(false);
      setSelectedReport(null);
    }
  };

  const generatePDF = async () => {
    if (!selectedSupplier) return;

    setIsGenerating(true);
    setGenerationProgress(10);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const doc = <SupplierReportPDF supplier={selectedSupplier} />;
      const blob = await pdf(doc).toBlob();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      const url = URL.createObjectURL(blob);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        window.open(url, '_blank');
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o relatório. Tente novamente.");
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-4xl font-black text-[#02416D] tracking-tight">Relatórios</h2>
        <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
          <BarChart3 size={16} className="text-[#AEDD2B]" />
          Gere documentos oficiais e análises detalhadas do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Supplier Report Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => handleOpenReport('fornecedor')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 cursor-pointer group transition-all"
        >
          <div className="w-16 h-16 bg-[#F8F8EC] rounded-2xl flex items-center justify-center text-[#AEDD2B] mb-6 group-hover:bg-[#AEDD2B] group-hover:text-[#02416D] transition-all">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-black text-[#02416D] mb-2">Fornecedor</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Gere um relatório detalhado com todos os dados cadastrais de um fornecedor específico.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[#0A5483] font-bold text-xs uppercase tracking-widest">
            <span>Configurar Relatório</span>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              &rarr;
            </motion.div>
          </div>
        </motion.div>

        {/* NAFs in Folder Report Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => handleOpenReport('nafs_pasta')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 cursor-pointer group transition-all"
        >
          <div className="w-16 h-16 bg-[#F8F8EC] rounded-2xl flex items-center justify-center text-[#AEDD2B] mb-6 group-hover:bg-[#AEDD2B] group-hover:text-[#02416D] transition-all">
            <Archive size={32} />
          </div>
          <h3 className="text-xl font-black text-[#02416D] mb-2">NAFs na Pasta</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lista completa de todos os protocolos que ainda estão fisicamente na pasta (Situação: NA PASTA).
          </p>
          <div className="mt-6 flex items-center gap-2 text-[#0A5483] font-bold text-xs uppercase tracking-widest">
            <span>Gerar Agora</span>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              &rarr;
            </motion.div>
          </div>
        </motion.div>

        {/* Medicine Expiry Report Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => handleOpenReport('vencimento')}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 cursor-pointer group transition-all"
        >
          <div className="w-16 h-16 bg-[#F8F8EC] rounded-2xl flex items-center justify-center text-[#AEDD2B] mb-6 group-hover:bg-[#AEDD2B] group-hover:text-[#02416D] transition-all">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-black text-[#02416D] mb-2">Vencimento</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Relatório de medicamentos com vencimento nos próximos 60 dias para controle de estoque.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[#0A5483] font-bold text-xs uppercase tracking-widest">
            <span>Gerar Agora</span>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              &rarr;
            </motion.div>
          </div>
        </motion.div>

        {/* Placeholder for future reports */}
        <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
          <FileText size={32} className="text-gray-300 mb-4" />
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Novos Relatórios em Breve</p>
        </div>
      </div>

      {/* Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-[#02416D]/40 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              {/* Progress Overlay */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center"
                  >
                    <div className="relative mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-4 border-gray-100 border-t-[#AEDD2B]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-[#02416D]">{generationProgress}%</span>
                      </div>
                    </div>
                    
                    <h4 className="text-2xl font-black text-[#02416D] mb-2 uppercase tracking-tight">Compilando Relatório</h4>
                    <p className="text-gray-500 font-medium max-w-xs">Aguarde enquanto preparamos o documento oficial para visualização.</p>
                    
                    <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full mt-8 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        className="h-full bg-gradient-to-r from-[#0A5483] to-[#AEDD2B]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedReport === 'fornecedor' && (
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-[#02416D] tracking-tight">Relatório de Fornecedor</h3>
                      <p className="text-gray-500 font-medium mt-1">Selecione o fornecedor para gerar o documento.</p>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      disabled={isGenerating}
                      className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 disabled:opacity-0"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Buscar por nome ou documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#AEDD2B] focus:bg-white rounded-2xl transition-all outline-none font-medium text-gray-700"
                      />
                    </div>

                    {/* Suppliers List */}
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {isLoadingSuppliers ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-[#0A5483] animate-spin" />
                          <p className="text-[#0A5483] font-bold text-xs uppercase tracking-widest">Carregando Parceiros...</p>
                        </div>
                      ) : filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => (
                          <div 
                            key={supplier.id}
                            onClick={() => setSelectedSupplier(supplier)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              selectedSupplier?.id === supplier.id 
                                ? 'border-[#AEDD2B] bg-[#AEDD2B]/5' 
                                : 'border-transparent bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div>
                              <p className="font-black text-[#02416D]">{supplier.name}</p>
                              <p className="text-xs text-gray-500 font-medium">{supplier.document}</p>
                            </div>
                            {selectedSupplier?.id === supplier.id && (
                              <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-8 h-8 bg-[#AEDD2B] rounded-full flex items-center justify-center text-[#02416D] shadow-sm"
                              >
                                <Check size={18} strokeWidth={4} />
                              </motion.div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-gray-400">
                          <p className="font-bold uppercase tracking-widest text-xs">Nenhum fornecedor encontrado</p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button 
                      disabled={!selectedSupplier || isGenerating}
                      onClick={generatePDF}
                      className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                        !selectedSupplier || isGenerating
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                          : 'bg-[#0A5483] text-white hover:bg-[#02416D] shadow-[#0A5483]/20 active:scale-95'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          GERANDO PDF...
                        </>
                      ) : (
                        <>
                          <Download size={24} />
                          GERAR RELATÓRIO
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RelatoriosPage;
