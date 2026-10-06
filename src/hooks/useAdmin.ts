import { useState } from 'react';
import { toast } from 'sonner';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ENDPOINT 1: Cargar la lista global con roles (Para el Tab de Configuración / Toggle)
  const fetchUsuariosSystem = async () => {
    setLoading(true); 
    try {
      const res = await fetch('https://hospital-uta-backend-fu3b.onrender.com/admin/usuarios', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar usuarios globales');
      return data;
    } catch (error: any) {
      console.error('Error en fetchUsuarios:', error.message);
      toast.error('Error de sincronización', { description: error.message });
      return [];
    } finally {
      setLoading(false); 
    }
  };

  //  ENDPOINT 2: Toggle Bar de Roles (Asciende/Desciende privilegios)
  const toggleUserRoleSystem = async (id: string, nuevoRol: string) => {
    setLoading(true); 
    try {
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/admin/usuarios/${id}/toggle-role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ nuevoRol })
      });
      if (!res.ok) throw new Error('No se pudo alterar el rango');
      return true;
    } catch (error: any) {
      toast.error('Error de rango', { description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    fetchUsuariosSystem, 
    toggleUserRoleSystem, 
    loading 
  };
};
