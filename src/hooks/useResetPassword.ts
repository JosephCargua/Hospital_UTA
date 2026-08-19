import { useState } from 'react';
import { toast } from 'sonner';

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);

  const resetPasswordUser = async (newPassword: string) => {
    setLoading(true);

    try {
      const hash = window.location.hash;

      // Extraemos limpiamente ambos tokens usando Regex
      const matchAccess = hash.match(/access_token=([^&]*)/);
      const matchRefresh = hash.match(/refresh_token=([^&]*)/);

      const accessToken = matchAccess ? matchAccess[1] : null;
      const refreshToken = matchRefresh ? matchRefresh[1] : null;

      if (!accessToken || !refreshToken) {
        throw new Error('El enlace de recuperación es inválido o sus componentes expiraron.');
      }

      // Mandamos el accessToken en el Bearer ordinario, y el refreshToken en una cabecera personalizada
      const response = await fetch('https://hospital-uta-backend-fu3b.onrender.com/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-refresh-token': refreshToken // Enviamos el refresh token de soporte
        },
        body: JSON.stringify({ newPassword }), 
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMsg || 'No se pudo actualizar la contraseña.');
      }

      toast.success('¡Contraseña restablecida!', {
        description: 'Tu contraseña ha sido actualizada con éxito. Redirigiendo...',
        duration: 4000,
      });

      return true; 
    } catch (error: any) {
      console.error('Error en ResetPassword Hook:', error.message);
      toast.error('Error al cambiar contraseña', {
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { resetPasswordUser, loading };
};
