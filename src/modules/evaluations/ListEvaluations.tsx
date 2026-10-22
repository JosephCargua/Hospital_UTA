import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ListEvaluations() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://hospital-uta-backend-fu3b.onrender.com/evaluations/docente', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvaluations(data);
      } else {
        console.error("Error fetching evaluations");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    toast.warning(`¿Eliminar la evaluación "${title}"?`, {
      description: 'Esta acción removerá de forma permanente la evaluación, sus preguntas y calificaciones asociadas.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const token = localStorage.getItem('token');
          try {
            const response = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/evaluations/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              toast.success(`Evaluación "${title}" eliminada correctamente`);
              setEvaluations(prev => prev.filter(ev => ev.id !== id));
            } else {
              const err = await response.json().catch(() => null);
              toast.error(err?.message || 'Error al eliminar la evaluación');
            }
          } catch (error) {
            console.error('Delete error:', error);
            toast.error('Error de red al intentar eliminar');
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Cargando evaluaciones...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mis Evaluaciones</h1>
        <button 
          onClick={() => navigate('/dashboard/evaluations/create')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          + Crear Nueva
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paralelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiantes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No has creado evaluaciones aún.</td>
              </tr>
            ) : (
              evaluations.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{ev.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ev.semestre || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ev.paralelo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ev.submissions_count} / {ev.total_students > 0 ? ev.total_students : '?'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                      ev.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ev.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button 
                      onClick={() => navigate(`/dashboard/evaluations/${ev.id}`)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Ver Detalle
                    </button>
                    <button 
                      onClick={() => handleDelete(ev.id, ev.title)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
