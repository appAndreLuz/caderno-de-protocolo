
import React from 'react';
import { NAF } from '../../types';
import NotebookPage from './NotebookPage';

interface NotebookViewProps {
  pageNumber: number;
  nafs: NAF[];
}

const NotebookView: React.FC<NotebookViewProps> = ({ pageNumber, nafs }) => {
  return (
    <div className="relative mx-auto flex justify-center perspective-2000">
      {/* Notebook Container */}
      <div className="relative flex bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,65,109,0.2),0_15px_35px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200 min-h-[1200px] paper-texture w-full max-w-[1000px]">
        
        {/* Left Edge Holes (Spiral) */}
        <div className="absolute left-0 top-0 w-16 h-full bg-[#E2E8F0] flex flex-col items-center justify-around py-10 z-20 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.1)]">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-8 h-5 bg-gradient-to-r from-[#94A3B8] via-[#CBD5E1] to-[#94A3B8] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] border border-black/10" />
          ))}
        </div>

        {/* Page Content */}
        <div className="relative flex-1 ml-16 bg-white">
          <NotebookPage pageNumber={pageNumber} nafs={nafs} side="right" />
          
          {/* Inner Depth Shadow (Left edge near spiral) */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10" />
        </div>

        {/* Right Edge Detail */}
        <div className="absolute right-0 top-0 w-4 h-full bg-gradient-to-l from-black/5 to-transparent z-20" />
      </div>
      
      {/* Table Shadow */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[90%] h-24 bg-[#02416D]/10 blur-[60px] -z-10 rounded-full" />
    </div>
  );
};

export default NotebookView;
