
import React, { useState, useEffect } from 'react';
import { RefreshCw, BookMarked, Quote } from 'lucide-react';
import { Psalm } from '../../types';
import { getRandomPsalm, persistPsalm, getPersistedPsalm } from '../../services/psalmService';

interface PsalmCardProps {
  refreshTrigger?: number;
}

const PsalmCard: React.FC<PsalmCardProps> = ({ refreshTrigger }) => {
  const [psalm, setPsalm] = useState<Psalm | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateNewPsalm = () => {
    setIsLoading(true);
    // Simulate a brief natural feeling delay for animation
    setTimeout(() => {
      const newPsalm = getRandomPsalm();
      setPsalm(newPsalm);
      persistPsalm(newPsalm);
      setIsLoading(false);
    }, 400);
  };

  // Initial load
  useEffect(() => {
    const saved = getPersistedPsalm();
    if (saved) {
      setPsalm(saved);
    } else {
      generateNewPsalm();
    }
  }, []);

  // Listen to external refresh trigger (clicks on Sidebar Dashboard menu)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      generateNewPsalm();
    }
  }, [refreshTrigger]);

  if (!psalm) return null;

  return (
    <div className="bg-gradient-to-br from-[#0A5483] to-[#02416D] dark:from-slate-900 dark:to-black text-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/20 relative overflow-hidden group transition-all duration-500 hover:shadow-blue-900/30 hover:translate-y-[-4px]">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#AEDD2B] rounded-xl text-[#02416D] shadow-lg shadow-[#AEDD2B]/20 transition-transform group-hover:scale-110">
              <BookMarked size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Salmo Diário</h3>
              <p className="text-[10px] text-white/50 dark:text-slate-500 uppercase font-bold tracking-widest">Inspiração & Sabedoria</p>
            </div>
          </div>
          
          <button 
            onClick={generateNewPsalm}
            disabled={isLoading}
            className={`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 dark:hover:bg-slate-800 transition-all border border-white/10 ${isLoading ? 'animate-spin opacity-50' : 'active:scale-95'}`}
            title="Gerar novo Salmo"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-5">
            <Quote className="text-[#AEDD2B] shrink-0 opacity-30 rotate-180" size={32} />
            <div className="space-y-4">
               <div className="inline-block px-3 py-1 bg-white/10 dark:bg-slate-800 rounded-full text-[9px] font-bold text-[#AEDD2B] border border-white/10 dark:border-slate-700 uppercase tracking-widest">
                SALMO {psalm.number}
              </div>
              <p className={`text-xl md:text-2xl leading-relaxed italic font-medium transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                "{psalm.text}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none group-hover:bg-white/10 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#AEDD2B]/5 rounded-full -ml-24 -mb-24 blur-[80px] pointer-events-none group-hover:bg-[#AEDD2B]/10 transition-colors duration-700" />
    </div>
  );
};

export default PsalmCard;
