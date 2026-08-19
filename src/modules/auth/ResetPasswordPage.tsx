import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'; // 🚀 Importamos Eye y EyeOff
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResetPassword } from '@/hooks/useResetPassword';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPasswordUser, loading } = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 🚀 Estados independientes para controlar la visibilidad de cada input
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.warning('Validación de campos', {
        description: 'Las contraseñas ingresadas no coinciden.',
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error('Contraseña insegura', {
        description: 'Debe contener mínimo 8 caracteres, incluir letras mayúsculas, minúsculas y al menos un carácter especial (@, $, !, %, *, ?, &, #).',
        duration: 6000
      });
      return;
    }

    const success = await resetPasswordUser(password);

    if (success) {
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/signin');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 py-6 sm:py-10">
      <Card className="max-w-md w-full rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-white">
        
        <CardHeader className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="bg-[#0b1d33]/5 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#0b1d33] shadow-sm border border-[#0b1d33]/10">
            <ShieldCheck size={28} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm px-2 sm:px-4">
            Por seguridad, ingresa una contraseña que tenga un mínimo de 8 caracteres, incluyendo mayúsculas, minúsculas y un carácter especial.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-8 pb-8 sm:pb-10">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleResetPassword}>
            
            {/* Input 1: Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase ml-1 text-slate-600 tracking-wider">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="password"
                  // 🚀 El tipo cambia dinámicamente entre 'password' y 'text'
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mín. 8 caracteres (A, a, 1, #)" 
                  className="pl-11 pr-11 py-5 sm:py-6 rounded-xl sm:rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-[#0b1d33] transition-all shadow-sm text-sm"
                />
                {/* 🚀 Botón interactivo del Ojo incrustado a la derecha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Input 2: Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase ml-1 text-slate-600 tracking-wider">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="confirmPassword"
                  // 🚀 Cambia dinámicamente entre 'password' y 'text'
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repite tu nueva contraseña" 
                  className="pl-11 pr-11 py-5 sm:py-6 rounded-xl sm:rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-[#0b1d33] transition-all shadow-sm text-sm"
                />
                {/* 🚀 Botón interactivo del Ojo incrustado a la derecha */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#c29b38] hover:bg-[#aa842f] text-white font-bold py-6 sm:py-7 rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-95 text-sm sm:text-base mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando credenciales...
                </>
              ) : "Guardar Nueva Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
