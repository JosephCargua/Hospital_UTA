import { useState } from 'react';
import { toast } from 'sonner';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const sendResetEmail = async (email: string) => {
    setLoading(true);

    try {
      const response = await fetch('https://hospital-uta-backend-fu3b.onrender.com/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      // Notificación de éxito con Sonner
      toast.success('¡Correo enviado con éxito!', {
        description: data.message || 'Se ha enviado un enlace de recuperación a tu correo institucional.',
        duration: 5000,
      });

      return true; // Control de éxito para limpiar la vista
    } catch (error: any) {
      console.error('Error en ForgotPassword Hook:', error.message);
      toast.error('No se pudo enviar el enlace', {
        description: error.message || 'Ocurrió un problema inesperado. Inténtalo más tarde.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendResetEmail, loading };
};
