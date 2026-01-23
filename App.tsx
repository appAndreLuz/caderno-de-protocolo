
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  LogOut, 
  BookOpen,
  Menu,
  X,
  Pill,
  Bell,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
  Book
} from 'lucide-react';
import { supabase } from './supabase';
import { SystemAlert } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fornecedores from './pages/Fornecedores';
import Nafs from './pages/Nafs';
import Baixas from './pages/Baixas';
import Relatorios from './pages/Relatorios';
import Admin from './pages/Admin';
import Medicamentos from './pages/Medicamentos';
import CadernoDigital from './pages/CadernoDigital';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' 
        : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md hover:shadow-gray-200/50'
    }`}
  >
    <div className={`transition-all duration-500 transform ${
      active 
        ? 'scale-110' 
        : 'group-hover:scale-125 group-hover:-rotate-12 group-hover:text-blue-600'
    }`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
      active ? 'translate-x-1 opacity-100' : 'group-hover:translate-x-1 opacity-80 group-hover:opacity-100'
    }`}>
      {label}
    </span>
  </Link>
);

const AppLayout = ({ children, onLogout }: { children?: React.ReactNode, onLogout: () => void }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    const checkAlerts = async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const next30 = new Date();
      next30.setDate(today.getDate() + 30);
      const next30Str = next30.toISOString().split('T')[0];
      
      const thresholdDaysAgo = new Date();
      thresholdDaysAgo.setDate(today.getDate() - 10);
      const thresholdDaysAgoStr = thresholdDaysAgo.toISOString().split('T')[0];

      const [medsRes, nafsRes] = await Promise.all([
        supabase.from('medicamentos').select('*').lte('validade', next30Str),
        supabase.from('nafs').select('*').is('data_baixa', null).lte('data_entrada', thresholdDaysAgoStr)
      ]);

      const newAlerts: SystemAlert[] = [];

      medsRes.data?.forEach(m => {
        const isExpired = new Date(m.validade) < today;
        newAlerts.push({
          id: `med-${m.id}`,
          type: isExpired ? 'critical' : 'warning',
          category: 'medicamento',
          title: isExpired ? 'Medicamento Vencido' : 'Vencimento Próximo',
          message: `${m.nome} (Lote: ${m.lote}) ${isExpired ? 'venceu em' : 'vence em'} ${new Date(m.validade).toLocaleDateString('pt-BR')}`,
          link: '/medicamentos'
        });
      });

      nafsRes.data?.forEach(n => {
        newAlerts.push({
          id: `naf-${n.id}`,
          type: 'warning',
          category: 'protocolo',
          title: 'Protocolo Estagnado',
          message: `NAF ${n.numero_naf} está sem baixa há mais de 10 dias.`,
          link: '/baixas'
        });
      });

      setAlerts(newAlerts);
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm">
            <BookOpen size={20} />
          </div>
          <span className="font-black text-blue-900 tracking-tighter text-lg uppercase">Protocolo</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsNotificationsOpen(true)} className="p-2 text-gray-400 relative transition-transform active:scale-90">
            <Bell size={22} />
            {alerts.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 transition-transform active:scale-90">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-50 border-r border-gray-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center space-x-3 group cursor-default">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200 transition-transform duration-700 group-hover:rotate-[360deg]">
                  <BookOpen size={26} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 w-3 h-3 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] leading-none mb-0.5">Sistema de</span>
                <span className="font-black text-xl leading-none text-blue-900 tracking-tighter uppercase">Protocolo</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 custom-scrollbar overflow-y-auto pr-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <SidebarItem to="/fornecedores" icon={Users} label="Fornecedores" active={location.pathname === '/fornecedores'} />
            <SidebarItem to="/nafs" icon={FileText} label="NAF's" active={location.pathname === '/nafs'} />
            <SidebarItem to="/caderno" icon={Book} label="Folhear Caderno" active={location.pathname === '/caderno'} />
            <SidebarItem to="/baixas" icon={CheckCircle2} label="Baixas" active={location.pathname === '/baixas'} />
            <SidebarItem to="/medicamentos" icon={Pill} label="Medicamentos" active={location.pathname === '/medicamentos'} />
            <SidebarItem to="/relatorios" icon={BarChart3} label="Relatórios" active={location.pathname === '/relatorios'} />
            <SidebarItem to="/admin" icon={Settings} label="Administração" active={location.pathname === '/admin'} />
          </nav>

          <div className="mt-6 space-y-3">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
            >
              <div className="flex items-center space-x-3 text-gray-500 group-hover:text-blue-600">
                <div className="relative">
                  <Bell size={18} className="transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Notificações</span>
              </div>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">{alerts.length}</span>
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-600 transition-all group"
            >
              <LogOut size={18} className="transition-transform duration-500 group-hover:-translate-x-1" />
              <span className="font-black text-[10px] uppercase tracking-widest">Finalizar Sessão</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 custom-scrollbar overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Notifications Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-out ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Central de Alertas</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alerts.length} registros ativos</p>
              </div>
            </div>
            <button onClick={() => setIsNotificationsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="bg-emerald-50 p-6 rounded-full text-emerald-500">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Tudo em ordem!</h4>
                  <p className="text-sm text-gray-500">Nenhum alerta crítico ou pendência detectada no momento.</p>
                </div>
              </div>
            ) : (
              alerts.map((alert) => (
                <Link 
                  key={alert.id} 
                  to={alert.link}
                  onClick={() => setIsNotificationsOpen(false)}
                  className={`block p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 ${
                    alert.type === 'critical' 
                      ? 'bg-red-50 border-red-100 hover:border-red-200' 
                      : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      alert.type === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {alert.category === 'medicamento' ? <Pill size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          alert.type === 'critical' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {alert.title}
                        </span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </div>
                      <p className="text-xs font-medium text-gray-700 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className="p-6 bg-gray-50 border-t">
             <Link 
               to="/admin" 
               onClick={() => setIsNotificationsOpen(false)}
               className="w-full py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-gray-100 transition-all flex items-center justify-center"
             >
               Configurar Alertas
             </Link>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {(isSidebarOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" 
          onClick={() => {
            setIsSidebarOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_session') === 'true';
  });

  const handleLogin = (success: boolean) => {
    if (success) {
      localStorage.setItem('auth_session', 'true');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_session');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <AppLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/caderno" element={<CadernoDigital />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/nafs" element={<Nafs />} />
          <Route path="/medicamentos" element={<Medicamentos />} />
          <Route path="/baixas" element={<Baixas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};

export default App;
