import { useState } from 'react';

export const useRooms = () => {
  const [loadingRooms, setLoadingRooms] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 1. LEER SALAS
  const fetchRoomsSystem = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('https://hospital-uta-backend-fu3b.onrender.com/rooms', { 
        headers: getHeaders() 
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching medical rooms:', error);
      return [];
    } finally {
      setLoadingRooms(false);
    }
  };

  // 2. CREAR SALA (POST)
  const createRoomSystem = async (name: string, description: string) => {
    try {
      const res = await fetch('https://hospital-uta-backend-fu3b.onrender.com/rooms', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nombre: name, descripcion: description })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'Error al crear la sala médica' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de red al intentar registrar la sala médica' };
    }
  };

  // 3. EDITAR SALA (PUT)
  const updateRoomSystem = async (id: any, name: string, description: string) => {
    try {
      const cleanId = Number(id);
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/rooms/${cleanId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nombre: name, descripcion: description })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'Error al actualizar la sala médica' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de red al intentar actualizar la sala médica' };
    }
  };

  const deleteRoomSystem = async (id: number) => {
    try {
      // 🚀 EXTRACCIÓN INMEDIATA DE SEGURIDAD
      const currentToken = localStorage.getItem('token');
      
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/rooms/${id}`, { 
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, error: errorMsg || 'No se pudo eliminar la sala médica' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'No se pudo conectar con el servidor para eliminar la sala' };
    }
  };

  return { 
    fetchRoomsSystem, 
    createRoomSystem, 
    updateRoomSystem,
    deleteRoomSystem, 
    loadingRooms 
  };
};
