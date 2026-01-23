
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const range = 2; // Quantas páginas mostrar ao redor da atual

    // Sempre mostrar a primeira página
    pages.push(1);

    if (currentPage > range + 2) {
      pages.push('...');
    }

    // Calcular o intervalo central
    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - (range + 1)) {
      pages.push('...');
    }

    // Sempre mostrar a última página se houver mais de uma
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
        title="Página Anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center space-x-1.5">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-300 font-black tracking-widest">
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              disabled={isLoading}
              className={`
                min-w-[42px] h-10 px-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all shadow-sm
                ${isCurrent 
                  ? 'bg-blue-600 text-white scale-110 z-10 shadow-lg shadow-blue-500/20' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'}
              `}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
        title="Próxima Página"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
