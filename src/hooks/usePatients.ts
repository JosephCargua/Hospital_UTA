import { useState } from 'react';
import { toast } from 'sonner';

export const usePatients = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const API_URL = 'https://hospital-uta-backend-fu3b.onrender.com/patient';

  const fetchPatientsSystem = async () => {
    setLoadingPatients(true);
    try {
      const res = await fetch(API_URL, { 
        headers: getHeaders() 
      });
      if (!res.ok) {
        return [];
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    } finally {
      setLoadingPatients(false);
    }
  };

  const createPatientSystem = async (unityTag: string, name: string, description: string) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          unity_tag: unityTag, 
          nombre: name, 
          descripcion: description 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'Error al registrar el paciente' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const updatePatientSystem = async (id: number, unityTag: string, name: string, description: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ 
          unity_tag: unityTag, 
          nombre: name, 
          descripcion: description 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'Error al actualizar el paciente' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const deletePatientSystem = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE', 
        headers: getHeaders() 
      });
      if (res.ok) {
        toast.success('Paciente eliminado correctamente');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('No se pudo eliminar el paciente');
      return false;
    }
  };

  return { 
    fetchPatientsSystem, 
    createPatientSystem, 
    updatePatientSystem, 
    deletePatientSystem, 
    loadingPatients 
  };
};
