import { useState } from 'react';
import { toast } from 'sonner';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signUpUser = async (payload: Record<string, any>) => {
    setLoading(true);

    try {
      const response = await fetch('https://hospital-uta-backend.onrender.com/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        
        if (errorMsg === 'User already registered') {
          errorMsg = 'El correo ya se encuentra registrado en el sistema.';
        }

        throw new Error(errorMsg || 'Error al procesar el registro');
      }

      toast.success('¡Registro Exitoso!', {
        description: 'Inicia Sesión en el Hospital Virtual UTA',
        duration: 4000,
      });

      return true; 
    } catch (error: any) {
      console.error('Error en SignUp Hook:', error.message);
      toast.error('Error en el registro', {
        description: error.message || 'Intente nuevamente más tarde.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signUpUser, loading };
};