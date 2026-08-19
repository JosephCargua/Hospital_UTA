import { useState } from 'react';
import { toast } from 'sonner';

export const useStudents = () => {
  const [loadingStudents, setLoadingStudents] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ENDPOINT 1: Cargar exclusivamente Alumnos (Para el Tab de Alumnos)
  const fetchAlumnosSystem = async () => {
    setLoadingStudents(true); 
    try {
      const res = await fetch('https://hospital-uta-backend-fu3b.onrender.com/students', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar alumnos');
      return data;
    } catch (error: any) {
      console.error('Error en fetchAlumnos:', error.message);
      toast.error('Error de lectura', { description: error.message || 'No se pudo conectar con el servidor local.' });
      return [];
    } finally {
      setLoadingStudents(false); 
    }
  };

  // 🛠️ ENDPOINT 2: UPDATE - Editar la información académica desde el UserModal
  const updateAlumnoData = async (id: string, nombres: string, apellidos: string, semestre: string, paralelo: string) => {
    setLoadingStudents(true);
    try {

      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nombres, apellidos, semestre, paralelo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo actualizar el registro');
      return true;
    } catch (error: any) {
      toast.error('Error al editar', { description: error.message });
      return false;
    } finally {
      setLoadingStudents(false);
    }
  };

  // 🗑️ ENDPOINT 3: DELETE - Eliminar estudiante del sistema
  const deleteAlumnoSystem = async (id: string) => {
    setLoadingStudents(true); // 🎛️ OPTIMIZADO: Muestra estado de carga durante el borrado
    try {
      
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('No se pudo eliminar al estudiante');
      return true;
    } catch (error: any) {
      toast.error('Error al eliminar', { description: error.message });
      return false;
    } finally {
      setLoadingStudents(false);
    }
  };

  return { 
    fetchAlumnosSystem, 
    updateAlumnoData, 
    deleteAlumnoSystem, 
    loadingStudents 
  };
};
