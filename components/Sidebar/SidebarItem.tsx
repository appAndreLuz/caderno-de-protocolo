
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../types';

interface SidebarItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, isExpanded, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <div className="relative flex items-center px-2 py-1">
      <motion.button
        onClick={() => onClick(item.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ x: isExpanded ? 4 : 0 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative w-full flex items-center gap-4 px-3 py-3 transition-colors duration-200 rounded-xl group overflow-hidden
          ${isActive 
            ? 'bg-[#AEDD2B] text-[#02416D] shadow-lg shadow-[#AEDD2B]/20' 
            : 'text-white/70 hover:bg-[#066699] hover:text-white'}
          ${!isExpanded ? 'justify-center' : 'justify-start'}
        `}
      >
        {/* Background Highlight para Active Tab */}
        {isActive && (
          <motion.div 
            layoutId="sidebar-active-pill"
            className="absolute inset-0 bg-[#AEDD2B] -z-10"
            transition={{ type: "tween", duration: 0.2 }}
          />
        )}

        <motion.div 
          animate={{ 
            scale: isHovered ? 1.2 : (isActive ? [1, 1.1, 1] : 1),
            rotate: isHovered ? [0, -10, 10, 0] : 0
          }}
          transition={{ 
            duration: 0.3,
            scale: isActive && !isHovered ? { repeat: Infinity, duration: 2 } : { duration: 0.3 },
            rotate: {
              repeat: isHovered ? Infinity : 0,
              duration: 0.5
            }
          }}
          className={`relative shrink-0 ${isActive ? 'text-[#02416D]' : ''}`}
        >
          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {isExpanded && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <motion.span 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`truncate text-sm tracking-wide whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}
              >
                {item.label}
              </motion.span>
            </div>
          )}
        </AnimatePresence>

        {isActive && isExpanded && (
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="ml-auto w-1 h-5 rounded-full bg-[#02416D]/30 shrink-0" 
          />
        )}
      </motion.button>

      {/* Tooltip para modo recolhido */}
      {!isExpanded && isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 15 }}
          className="fixed left-16 z-[100] px-3 py-2 bg-[#02416D] text-white text-xs font-bold rounded-lg shadow-xl border border-[#066699] pointer-events-none whitespace-nowrap"
          style={{ willChange: 'transform, opacity' }}
        >
          {item.label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#02416D] rotate-45 border-l border-b border-[#066699]" />
        </motion.div>
      )}
    </div>
  );
};

export default SidebarItem;
