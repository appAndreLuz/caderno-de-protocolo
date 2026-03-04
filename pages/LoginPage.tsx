
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from '../components/Branding/Logo';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulação de delay para feedback visual
    setTimeout(() => {
      if (username === 'André' && password === '1987') {
        onLogin(username);
      } else {
        setError('Usuário ou senha incorretos.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8EC] p-4 paper-texture">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#0A5483]/10 border border-[#0A5483]/5 overflow-hidden">
          <div className="bg-[#0A5483] p-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo variant="full" theme="light" size={48} />
            </div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Acesso Restrito</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#02416D] uppercase tracking-wider mb-2 ml-1">
                  Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0A5483]/40">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#F8F8EC]/50 border border-[#0A5483]/10 rounded-xl focus:ring-2 focus:ring-[#AEDD2B] focus:border-transparent transition-all outline-none text-[#02416D] font-medium"
                    placeholder="Seu nome de usuário"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#02416D] uppercase tracking-wider mb-2 ml-1">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0A5483]/40">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#F8F8EC]/50 border border-[#0A5483]/10 rounded-xl focus:ring-2 focus:ring-[#AEDD2B] focus:border-transparent transition-all outline-none text-[#02416D] font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0A5483] hover:bg-[#02416D] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0A5483]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">
                &copy; {new Date().getFullYear()} André Luz &bull; ProtoCaderno
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
