import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSignUp } from '@/hooks/useSignUp'; 
import { toast } from 'sonner';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUpUser, loading } = useSignUp(); 

  // Estados base comunes
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Control de Rol (3 = Estudiante, 2 = Docente)
  const [rolId, setRolId] = useState('3');
  
  // Estados específicos condicionales
  const [semestre, setSemestre] = useState('');
  const [paralelo, setParalelo] = useState('');
  const [materia, setMateria] = useState(''); 

  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. VALIDACIÓN COMPUESTA SEGÚN EL ROL SELECCIONADO
    if (rolId === '3' && (!semestre || !paralelo)) {
      toast.warning('Información incompleta', {
        description: 'Por favor, seleccione su semestre y paralelo académicos.',
      });
      return;
    }

    if (rolId === '2' && !materia) {
      toast.warning('Información incompleta', {
        description: 'Por favor, seleccione la materia que imparte en el laboratorio.',
      });
      return;
    }

    // 2. MOTOR DE SEGURIDAD ROBUSTO PARA LA CONTRASEÑA (8 caracteres, Mayúscula, Minúscula, Especial)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error('Contraseña Insegura', {
        description: 'Debe contener mínimo 8 caracteres, incluir mayúsculas, minúsculas y al menos un carácter especial (@, $, !, %, *, ?, &, #).',
        duration: 6000
      });
      return;
    }

    // CONSTRUCCIÓN DEL PAYLOAD CON INTERRUPTOR SEMÁNTICO
    const payload: Record<string, any> = {
      email,
      password,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      rol_id: Number(rolId),
    };

    if (rolId === '3') {
      payload.semestre = semestre;
      payload.paralelo = paralelo;
    } else if (rolId === '2') {
      payload.materia = materia; // Viaja el string exacto seleccionado en el combo box
    }

    const success = await signUpUser(payload);

    if (success) {
      // Limpieza absoluta de campos
      setNombres('');
      setApellidos('');
      setEmail('');
      setPassword('');
      setSemestre('');
      setParalelo('');
      setMateria('');

      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 py-6 sm:py-10">
      <Card className="max-w-2xl w-full rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border-none overflow-hidden">
        
        <CardHeader className="bg-[#0b1d33] text-white text-center p-6 sm:py-8">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm text-[#c29b38]">
            <UserPlus size={24} />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Registro de Usuarios</CardTitle>
          <CardDescription className="text-slate-300 opacity-90 text-xs sm:text-sm max-w-md mx-auto">
            Crea tu cuenta institucional para acceder al simulador clínico virtual
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSignUp}>
            
            {/* Grilla Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres" className="text-xs font-bold uppercase ml-1 text-slate-600">Nombres Completos</Label>
                <Input 
                  id="nombres"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                  placeholder="Ej: Gabriel Leonardo" 
                  className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos" className="text-xs font-bold uppercase ml-1 text-slate-600">Apellidos Completos</Label>
                <Input 
                  id="apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                  placeholder="Ej: Medina Vasco" 
                  className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
                />
              </div>
            </div>

            {/* Correo y Selección de Identificación de Rol */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase ml-1 text-slate-600">Correo Institucional</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@email.com" 
                  className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
                />
              </div>

              {/* SELECTOR PARA IDENTIFICACIÓN DE ROLES INSTITUCIONALES */}
              <div className="space-y-2">
                <Label htmlFor="rol" className="text-xs font-bold uppercase ml-1 text-slate-600">Tipo de Usuario</Label>
                <Select onValueChange={(value) => setRolId(value)} value={rolId}>
                  <SelectTrigger id="rol" className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33] font-medium text-slate-700">
                    <SelectValue placeholder="Seleccione Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Estudiante</SelectItem>
                    <SelectItem value="2">Docente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* RENDERIZADO COMPUESTO DINÁMICO SEGÚN ROL SELECCIONADO */}
            {rolId === '3' ? (
              /* PANEL DE METADATA PARA ESTUDIANTES (RANGO CONFIGURADO DESDE 6TO HASTA 9NO) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
                <div className="space-y-1 md:col-span-2 text-[#0b1d33] font-bold text-xs uppercase tracking-tight">
                  Información Académica Requerida
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semestre" className="text-[10px] font-bold uppercase text-slate-500">Semestre</Label>
                  <Select onValueChange={(value) => setSemestre(value)} value={semestre}>
                    <SelectTrigger id="semestre" className="rounded-lg bg-white py-5 focus:ring-[#0b1d33]">
                      <SelectValue placeholder="Seleccione Semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* 🚀 MODIFICADO: Rango específico ajustado para el ciclo clínico terminal */}
                      {['6to', '7mo', '8vo', '9no'].map(s => (
                        <SelectItem key={s} value={s}>{s} Semestre</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paralelo" className="text-[10px] font-bold uppercase text-slate-500">Paralelo</Label>
                  <Select onValueChange={(value) => setParalelo(value)} value={paralelo}>
                    <SelectTrigger id="paralelo" className="rounded-lg bg-white py-5 focus:ring-[#0b1d33]">
                      <SelectValue placeholder="Seleccione Paralelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A', 'B'].map(p => (
                        <SelectItem key={p} value={p}>Paralelo {p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              /* PANEL DE METADATA PARA DOCENTES (CONVERSIÓN EXITOSA A COMBOBOX) */
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
                <Label htmlFor="materia" className="text-xs font-bold uppercase ml-1 text-[#0b1d33]">Asignatura</Label>
                <Select onValueChange={(value) => setMateria(value)} value={materia}>
                  <SelectTrigger id="materia" className="rounded-xl bg-white py-5 sm:py-6 focus:ring-[#0b1d33] font-medium text-slate-700">
                    <SelectValue placeholder="Seleccione la Asignatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 🚀 ASIGNATURAS INSTITUCIONALES DEFINIDAS */}
                    <SelectItem value="ENFERMERIA EN CUIDADOS CRITICOS">Enfermería en Cuidados Críticos</SelectItem>
                    <SelectItem value="ENFERMERIA QUIRURGICA">Enfermería Quirúrgica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase ml-1 text-slate-600">Establecer Contraseña</Label>
              {/* 🚀 Envoltura relativa para posicionar el ojo */}
              <div className="relative">
                <Input 
                  id="password"
                  // 🚀 Alterna el tipo de entrada dinámicamente
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mín. 8 caracteres" 
                  className="rounded-xl bg-slate-50 py-5 sm:py-6 pr-11 focus:ring-[#0b1d33]" 
                />
                {/* 🚀 Botón interactivo absoluto del ojo */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#c29b38] hover:bg-[#aa842f] text-white font-bold py-5 sm:py-7 rounded-2xl shadow-xl transition-all active:scale-95 text-base sm:text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando Registro...
                </>
              ) : "Completar Registro"}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center pt-5 sm:pt-6 border-t border-slate-100">
            <Link 
              to="/signin" 
              className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-[#c29b38] transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
