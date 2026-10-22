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
    <div className="p-6 md:p-8 max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6 mt-6">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Mis Evaluaciones</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de exámenes y evaluaciones para simuladores VR</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/evaluations/create')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm text-sm"
        >
          + Crear Nueva
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="py-3.5 pl-6 pr-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Título</th>
              <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-24">Semestre</th>
              <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-24">Paralelo</th>
              <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-28">Estudiantes</th>
              <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-28">Estado</th>
              <th className="py-3.5 pl-3 pr-6 text-right text-xs font-bold text-slate-700 uppercase tracking-wider w-44">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {evaluations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                  No has creado evaluaciones aún.
                </td>
              </tr>
            ) : (
              evaluations.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 pl-6 pr-3 text-sm font-semibold text-gray-800 break-words">
                    {ev.title}
                  </td>
                  <td className="py-4 px-3 text-sm text-center text-gray-500 whitespace-nowrap">
                    {ev.semestre || '-'}
                  </td>
                  <td className="py-4 px-3 text-sm text-center text-gray-500 whitespace-nowrap">
                    {ev.paralelo || '-'}
                  </td>
                  <td className="py-4 px-3 text-sm text-center text-gray-500 whitespace-nowrap">
                    {ev.submissions_count} / {ev.total_students > 0 ? ev.total_students : '?'}
                  </td>
                  <td className="py-4 px-3 text-sm text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                      ev.estado === 'Activa' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {ev.estado}
                    </span>
                  </td>
                  <td className="py-4 pl-3 pr-6 text-sm font-medium text-right whitespace-nowrap space-x-3">
                    <button 
                      onClick={() => navigate(`/dashboard/evaluations/${ev.id}`)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver Detalle
                    </button>
                    <button 
                      onClick={() => handleDelete(ev.id, ev.title)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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
