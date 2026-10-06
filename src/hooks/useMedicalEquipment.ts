import { useState } from 'react';
import { toast } from 'sonner';

export const useMedicalEquipment = () => {
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 1. LEER CATÁLOGO
  const fetchEquipmentSystem = async () => {
    setLoadingEquipment(true);
    try {
      const res = await fetch('https://hospital-uta-backend-fu3b.onrender.com/equipment', { 
        headers: getHeaders() 
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching medical equipment:', error);
      return [];
    } finally {
      setLoadingEquipment(false);
    }
  };

  // 2. CREAR EQUIPO (POST) - Mejorado para interceptar excepciones controladas de BD
  const createEquipmentSystem = async (roomId: number, unityTag: string, name: string, description: string) => {
    try {
      const res = await fetch('https://hospital-uta-backend-fu3b.onrender.com/equipment', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          sala_id: Number(roomId), 
          unity_tag: unityTag, 
          nombre: name, 
          descripcion: description 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Captura el mensaje exacto enviado por NestJS (como el error 23505)
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'Error al catalogar el equipo' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // 3. EDITAR EQUIPO (PUT) - Mejorado para interceptar excepciones controladas de BD
  const updateEquipmentSystem = async (roomId: number, unityTag: string, name: string, description: string) => {
    try {
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/equipment/${unityTag}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ 
          sala_id: Number(roomId), 
          unity_tag: unityTag, 
          nombre: name, 
          descripcion: description 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'Error al actualizar el equipo' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // 4. ELIMINAR EQUIPO (DELETE)
  const deleteEquipmentSystem = async (id: number) => {
    try {
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/equipment/${id}`, { 
        method: 'DELETE', 
        headers: getHeaders() 
      });
      if (res.ok) {
        toast.success('Equipo médico removido del catálogo correctamente');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('No se pudo eliminar el equipo médico del catálogo');
      return false;
    }
  };

  return { 
    fetchEquipmentSystem, 
    createEquipmentSystem, 
    updateEquipmentSystem, 
    deleteEquipmentSystem, 
    loadingEquipment 
  };
};
