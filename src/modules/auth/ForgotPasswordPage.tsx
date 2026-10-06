import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForgotPassword } from '@/hooks/useForgotPassword';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const { sendResetEmail, loading } = useForgotPassword();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await sendResetEmail(email);
    
    if (success) {
      setEmail(''); // Limpiamos el input únicamente si la API respondió correctamente
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 py-6 sm:py-10">
      {/* Redondeado responsivo para móviles y sombras profundas */}
      <Card className="max-w-md w-full rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-white">
        
        {/* Cabecera con Icono adaptado al Azul Marino */}
        <CardHeader className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="bg-[#0b1d33]/5 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#0b1d33] shadow-sm border border-[#0b1d33]/10">
            <KeyRound size={28} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            ¿Problemas con tu acceso?
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-xs sm:text-sm px-2 sm:px-4">
            Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-8 pb-8 sm:pb-10">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase ml-1 text-slate-600 tracking-wider">
                Correo Institucional
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@uta.edu.ec" 
                  className="pl-11 py-5 sm:py-6 rounded-xl sm:rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-[#0b1d33] transition-all shadow-sm text-sm"
                />
              </div>
            </div>

            {/* Botón Principal enlazado al loading de nuestro Hook */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#c29b38] hover:bg-[#aa842f] text-white font-bold py-6 sm:py-7 rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-95 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando enlace...
                </>
              ) : "Enviar enlace de recuperación"}
            </Button>
          </form>

          {/* Separador sutil adaptable */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">O también puedes</span>
            </div>
          </div>

          {/* Retorno al login integrado en la paleta corporativa */}
          <div className="text-center">
            <Link 
              to="/signin" 
              className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-[#c29b38] transition-colors text-xs sm:text-sm group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform sm:w-4 sm:h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
