
import React, { useState } from 'react';
import { BookOpen, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Recupera a senha personalizada do localStorage ou usa a padrão
    const validPassword = localStorage.getItem('admin_pwd') || 'alsfokinha';
    
    if (username === 'André' && password === validPassword) {
      onLogin(true);
    } else {
      setError('Acesso negado. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 overflow-hidden relative z-10 border border-white">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[2rem] text-white shadow-2xl shadow-blue-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <BookOpen size={56} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-full border-4 border-white shadow-lg">
                <ShieldCheck size={20} className="text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Sistema de Gestão</p>
              <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Protocolo</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Identificação</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <UserIcon size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 text-black font-medium"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 text-black font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-blue-600/20 transform active:scale-[0.97] transition-all uppercase tracking-widest text-sm"
            >
              Autenticar
            </button>
          </form>
        </div>
        <div className="bg-gray-50/80 backdrop-blur-sm p-6 text-center border-t border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em]">
            Versão Corporativa 1.2.5 • Criptografia Ativa • Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
