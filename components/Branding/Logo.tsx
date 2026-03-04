
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark' | 'colored';
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  theme = 'colored', 
  className = "", 
  size = 40 
}) => {
  const isDark = theme === 'dark';
  const isLight = theme === 'light';
  
  // Cores baseadas na paleta institucional
  const primaryColor = isLight ? '#FFFFFF' : '#02416D'; // Azul Profundo
  const accentColor = '#AEDD2B'; // Verde Lima (Controle/Check)
  const textColor = isLight ? '#FFFFFF' : (isDark ? '#F8F8EC' : '#02416D');

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Símbolo do ProtoCaderno */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="initial"
        whileHover="hover"
      >
        {/* Capa do Caderno / Base do P */}
        <motion.path
          d="M10 6C10 4.89543 10.8954 4 12 4H28C29.1046 4 30 4.89543 30 6V34C30 35.1046 29.1046 36 28 36H12C10.8954 36 10 35.1046 10 34V6Z"
          fill={primaryColor}
          variants={{
            hover: { scale: 1.05 }
          }}
        />
        
        {/* Espiral/Vinco Lateral */}
        <rect x="12" y="8" width="2" height="24" rx="1" fill={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'} />
        
        {/* Linhas de Protocolo */}
        <motion.path
          d="M18 12H25"
          stroke={isLight ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <motion.path
          d="M18 18H25"
          stroke={isLight ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Check de Confirmação (Símbolo de Controle) */}
        <motion.path
          d="M18 26L21 29L26 23"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0.8, opacity: 0.8 },
            hover: { pathLength: 1, opacity: 1, scale: 1.1 }
          }}
        />
      </motion.svg>

      {/* Tipografia ProtoCaderno */}
      {variant === 'full' && (
        <motion.div 
          className="flex flex-col leading-tight select-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-lg font-black tracking-tight" style={{ color: textColor }}>
            PROTO<span className="font-light" style={{ color: accentColor }}>CADERNO</span>
          </span>
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-60" style={{ color: textColor }}>
            Gestão de Protocolo
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
