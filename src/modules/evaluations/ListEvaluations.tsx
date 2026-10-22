import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, Trash2 } from 'lucide-react';

export default function ListEvaluations() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
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

  // Métricas del Dashboard Superior
  const totalEvaluaciones = evaluations.length;
  const evaluacionesActivas = useMemo(
    () => evaluations.filter(e => e.is_active || e.estado === 'Activa').length,
    [evaluations]
  );
  const estudiantesEvaluados = useMemo(
    () => evaluations.reduce((sum, e) => sum + (e.submissions_count || 0), 0),
    [evaluations]
  );
  const promedioGlobal = useMemo(() => {
    const allScores: number[] = [];
    evaluations.forEach(ev => {
      if (Array.isArray(ev.scores) && ev.scores.length > 0) {
        allScores.push(...ev.scores);
      } else if (ev.avg_score != null && !isNaN(parseFloat(ev.avg_score))) {
        allScores.push(parseFloat(ev.avg_score));
      }
    });
    if (allScores.length === 0) return '0.00';
    const sum = allScores.reduce((acc, score) => acc + score, 0);
    return (sum / allScores.length).toFixed(2);
  }, [evaluations]);

  // Paginación
  const totalPages = Math.ceil(evaluations.length / pageSize) || 1;
  const currentEvaluations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return evaluations.slice(start, start + pageSize);
  }, [evaluations, currentPage]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Cargando evaluaciones...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-6 pb-12 px-4 sm:px-6">
      
      {/* 4 CARDS DASHBOARD SUPERIOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* TOTAL EVALUACIONES */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL EVALUACIONES
          </span>
          <div className="flex items-baseline mt-3">
            <span className="text-3xl font-black text-[#0284c7]">{totalEvaluaciones}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">registradas</span>
          </div>
        </div>

        {/* EVALUACIONES ACTIVAS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            EVALUACIONES ACTIVAS
          </span>
          <div className="flex items-baseline mt-3">
            <span className="text-3xl font-black text-[#16a34a]">{evaluacionesActivas}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">en sala VR</span>
          </div>
        </div>

        {/* ESTUDIANTES EVALUADOS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            ESTUDIANTES EVALUADOS
          </span>
          <div className="flex items-baseline mt-3">
            <span className="text-3xl font-black text-[#ca8a04]">{estudiantesEvaluados}</span>
          </div>
        </div>

        {/* PROMEDIO GLOBAL */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            PROMEDIO GLOBAL
          </span>
          <div className="flex items-baseline mt-3">
            <span className="text-3xl font-black text-slate-800">{promedioGlobal}</span>
            <span className="text-sm text-slate-400 font-normal ml-1.5">/ 10.0</span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL DE LA TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Instrumentos de Evaluación Clínica Configurados
          </h2>
          <button 
            onClick={() => navigate('/dashboard/evaluations/create')} 
            className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl transition font-bold shadow-sm text-sm inline-flex items-center justify-center gap-1.5"
          >
            + Crear Nueva (VR)
          </button>
        </div>

        {/* TABLA */}
        <div className="w-full overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full divide-y divide-slate-100">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="py-3.5 pl-6 pr-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  TÍTULO DEL INSTRUMENTO
                </th>
                <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-24">
                  SEMESTRE
                </th>
                <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-24">
                  PARALELO
                </th>
                <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-28">
                  ENVÍOS
                </th>
                <th className="py-3.5 px-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-28">
                  ESTADO
                </th>
                <th className="py-3.5 pl-3 pr-6 text-right text-xs font-bold text-slate-700 uppercase tracking-wider w-44">
                  ACCIÓN
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No has creado instrumentos de evaluación aún.
                  </td>
                </tr>
              ) : (
                currentEvaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 pl-6 pr-3">
                      <p className="text-sm font-bold text-slate-800 leading-snug">
                        {ev.title}
                      </p>
                      {ev.description && (
                        <p className="text-xs text-slate-400 font-normal line-clamp-1 mt-0.5">
                          {ev.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-3 text-sm text-center text-slate-600 font-medium whitespace-nowrap">
                      {ev.semestre || '-'}
                    </td>
                    <td className="py-4 px-3 text-sm text-center text-slate-600 font-medium whitespace-nowrap">
                      {ev.paralelo || '-'}
                    </td>
                    <td className="py-4 px-3 text-sm text-center text-slate-600 font-medium whitespace-nowrap">
                      {ev.submissions_count} / {ev.total_students > 0 ? ev.total_students : '?'}
                    </td>
                    <td className="py-4 px-3 text-sm text-center whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        ev.estado === 'Activa' 
                          ? 'bg-[#dcfce7] text-[#15803d]' 
                          : 'bg-[#f1f5f9] text-[#475569]'
                      }`}>
                        {ev.estado === 'Activa' ? 'Activa' : 'Cerrada'}
                      </span>
                    </td>
                    <td className="py-4 pl-3 pr-6 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => navigate(`/dashboard/evaluations/${ev.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0284c7] hover:bg-sky-50 rounded-lg transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye size={15} />
                          <span>Ver Detalle</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(ev.id, ev.title)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar evaluación"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PIE DE TABLA / PAGINACIÓN */}
        {evaluations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500">
            <span>
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, evaluations.length)}-{Math.min(currentPage * pageSize, evaluations.length)} de {evaluations.length} evaluaciones configuradas
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Ant
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-4 py-1.5 rounded-lg bg-[#0284c7] text-white text-sm font-semibold hover:bg-[#0369a1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Sig
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
