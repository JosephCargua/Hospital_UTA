import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exito = await login(email, password);
      if (exito) {
        toast.success('¡Inicio de Sesión Exitoso!', {
          description: 'Bienvenido al panel de administración clínica.',
          duration: 3000,
        });
      }
    } catch (error: any) {
      if (error.message === 'CUENTA_DOCENTE_PENDIENTE') {
        toast.warning('Autorización en Proceso', {
          description: 'Su registro como Docente se encuentra en revisión. Por favor, espere a que el Administrador apruebe su cuenta desde la plataforma.',
          duration: 7000,
        });
      } else if (error.message === 'ACCESO_ESTUDIANTE_VR') {
        toast.info('Acceso restringido en plataforma Web', {
          description: 'Tu cuenta de Estudiante está activa. Por favor, inicia sesión directamente dentro del simulador virtual en las gafas VR.',
          duration: 6000,
        });
      } else {
        toast.error('Error de autenticación', {
          description: error.message || 'Las credenciales ingresadas son incorrectas o no están registradas.',
          duration: 6000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 py-6 sm:py-10">
      <Card className="max-w-3xl w-full rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border-none">

        {/* PANEL IZQUIERDO VISUAL */}
        <div className="w-full md:w-[50%] bg-[#0b1d33] p-6 sm:p-8 px-4 sm:px-6 flex flex-col items-center justify-center text-white text-center space-y-4 sm:space-y-5 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 sm:w-48 sm:h-48 bg-slate-800 rounded-full opacity-30" />

          <div className="bg-white rounded-[1.2rem] sm:rounded-[1.5rem] shadow-xl relative z-10 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden">
            <img
              src="/img/Logito.png"
              alt="Logo UTA"
              className="w-full h-full object-contain scale-150"
            />
          </div>

          <div className="relative z-10 w-full">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1 sm:mb-2 leading-tight uppercase text-[#c29b38]">
              Hospital Virtual UTA
            </h1>
            <p className="text-slate-300 font-medium text-xs sm:text-sm opacity-90 max-w-xs mx-auto">
              Innovación en simulación clínica y educación en salud.
            </p>
          </div>
        </div>

        {/* PANEL DERECHO FORMULARIO */}
        <CardContent className="w-full md:w-[50%] p-6 sm:p-8 flex flex-col justify-center bg-white">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="bg-slate-100 p-2.5 sm:p-3 rounded-xl text-[#0b1d33] mb-2 sm:mb-3">
              <User size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Iniciar Sesión</h2>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase ml-1 text-slate-600">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@email.com"
                  className="pl-10 rounded-xl bg-slate-50 border-slate-200 py-5 sm:py-6 focus:ring-[#0b1d33]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase ml-1 text-slate-600">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10 pr-10 rounded-xl bg-slate-50 border-slate-200 py-5 sm:py-6 focus:ring-[#0b1d33]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to={loading ? "#" : "/forgot-password"}
                className={`text-xs font-bold text-[#c29b38] hover:underline ${loading ? "pointer-events-none opacity-50" : ""
                  }`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c29b38] hover:bg-[#aa842f] text-white font-bold py-5 sm:py-6 rounded-xl shadow-lg transition-all active:scale-95 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : "ENTRAR"}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center border-t border-slate-100 pt-4 sm:pt-6">
            <p className="text-slate-600 text-xs font-medium">
              ¿No tienes una cuenta?{' '}
              <Link to="/signup" className="text-[#c29b38] font-bold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
