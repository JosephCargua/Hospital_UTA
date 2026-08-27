import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, Stethoscope, Layout, Layers, LogOut, Settings, FileQuestion } from 'lucide-react'; 
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";

interface UsuarioSession {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';
}

const HomeLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userLogged, setUserLogged] = useState<UsuarioSession | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) { navigate('/signin'); return; }
    const parsedUser = JSON.parse(rawUser) as UsuarioSession;
    setUserLogged(parsedUser);

    if (parsedUser.rol === 'ESTUDIANTE') {
      localStorage.clear();
      navigate('/signin');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.info('Sesión finalizada');
    navigate('/signin');
  };

  if (!userLogged) return null;

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-sm sm:text-base">
      
      {/* SIDEBAR INSTITUCIONAL */}
      <aside className="w-64 bg-[#0b1d33] text-slate-300 flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-[#c29b38]/20 p-2 rounded-lg text-[#c29b38]"><Stethoscope size={20} /></div>
          <span className="font-bold text-white tracking-tight text-sm">Hospital Virtual UTA</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/students')} 
            className={`w-full justify-start gap-3 py-5 ${currentPath.includes('/students') ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            <Users size={18} /> Estudiantes
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/rooms')} 
            className={`w-full justify-start gap-3 py-5 ${currentPath.includes('/rooms') ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            <Layout size={18} /> Salas / Módulos
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/equipment')} 
            className={`w-full justify-start gap-3 py-5 ${currentPath.includes('/equipment') ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            <Layers size={18} /> Equipos Médicos
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/evaluations')} 
            className={`w-full justify-start gap-3 py-5 ${currentPath.includes('/evaluations') ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            <FileQuestion size={18} /> Evaluaciones (VR)
          </Button>

          {/* RENDERIZADO EXCLUSIVO PARA ROL ADMIN */}
          {userLogged.rol === 'ADMIN' && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard/settings')} 
              className={`w-full justify-start gap-3 py-5 ${currentPath.includes('/settings') ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
            >
              <Settings size={18} /> Configuración
            </Button>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800/60">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-red-400 font-semibold transition-all duration-200 hover:bg-red-700 hover:text-white"><LogOut size={18} /> Cerrar Sesión</Button>
        </div>
      </aside>

      {/* ÁREA DE PANEL CONTENEDOR */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#0b1d33]">
              {currentPath.includes('/students') && 'Gestión de Estudiantes'}
              {currentPath.includes('/rooms') && 'Salas de Simulación'}
              {currentPath.includes('/equipment') && 'Catálogo de Equipos Médicos'}
              {currentPath.includes('/evaluations') && 'Módulo de Evaluaciones'}
              {currentPath.includes('/settings') && 'Configuración de Sistema'}
            </h2>
            <span className="text-[10px] uppercase font-bold text-[#c29b38] tracking-wider -mt-1">Rango: {userLogged.rol}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#c29b38]/10 flex items-center justify-center text-[#c29b38] font-bold text-xs border border-[#c29b38]/20 uppercase">
            {userLogged.nombres[0]}{userLogged.apellidos[0]}
          </div>
        </header>

        <section className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default HomeLayout;
