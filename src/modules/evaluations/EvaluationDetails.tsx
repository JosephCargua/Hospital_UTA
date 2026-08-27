import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function EvaluationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const fetchDetails = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/evaluations/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Error fetching details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleCloseEvaluation = async () => {
    if (!confirm("¿Estás seguro de cerrar esta evaluación? Los estudiantes ya no podrán responder.")) return;
    
    setClosing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://hospital-uta-backend-fu3b.onrender.com/evaluations/${id}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        toast.success("Evaluación cerrada exitosamente");
        fetchDetails(); // Recargar datos
      } else {
        toast.error("Error al cerrar la evaluación");
      }
    } catch (err) {
      toast.error("Error de red");
    } finally {
      setClosing(false);
    }
  };

  const stats = useMemo(() => {
    if (!data || !data.submissions) return null;
    const scores = data.submissions.map((s: any) => parseFloat(s.score));
    const total = scores.length;
    const avg = total > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / total).toFixed(2) : 0;
    const max = total > 0 ? Math.max(...scores).toFixed(2) : 0;
    const min = total > 0 ? Math.min(...scores).toFixed(2) : 0;
    const approved = scores.filter((s: number) => s >= 7).length;
    const failed = total - approved;
    const pending = Math.max((data.total_students || 0) - total, 0);

    return { total, avg, max, min, approved, failed, pending };
  }, [data]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Cargando dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500 font-bold">Evaluación no encontrada.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold mb-2 inline-flex items-center">
            &larr; Volver
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{data.title}</h1>
          <p className="text-gray-500 mt-1">{data.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${data.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
            {data.is_active ? '🟢 Activa' : '⚪ Finalizada'}
          </span>
          {data.is_active && (
            <button 
              onClick={handleCloseEvaluation}
              disabled={closing}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {closing ? 'Cerrando...' : 'Cerrar Evaluación'}
            </button>
          )}
        </div>
      </div>

      {/* STATS DASHBOARD */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <p className="text-blue-100 text-sm font-medium">Promedio del Curso</p>
            <p className="text-4xl font-black mt-2">{stats.avg} <span className="text-lg font-normal opacity-80">/ 10</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Rendimiento</p>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-green-600">▲ {stats.max}</p>
                <p className="text-xs text-gray-400">Nota Alta</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-500">▼ {stats.min}</p>
                <p className="text-xs text-gray-400">Nota Baja</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Aprobación (≥ 7)</p>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-400">Aprobados</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                <p className="text-xs text-gray-400">Reprobados</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Participación</p>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total} <span className="text-lg text-gray-400 font-normal">/ {data.total_students || 0}</span></p>
                <p className="text-xs text-gray-400">Enviados</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-orange-400">{stats.pending}</p>
                <p className="text-xs text-gray-400">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METADATA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-8">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Semestre</p>
          <p className="text-lg font-medium text-gray-800">{data.semestre || 'No asignado'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Paralelo</p>
          <p className="text-lg font-medium text-gray-800">{data.paralelo || 'No asignado'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ENVIOS DE ESTUDIANTES */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Resultados de Estudiantes
            <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">{data.submissions?.length || 0}</span>
          </h2>
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nota</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(!data.submissions || data.submissions.length === 0) ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                      Aún no hay respuestas registradas para esta evaluación.
                    </td>
                  </tr>
                ) : (
                  data.submissions.map((sub: any) => {
                    const isApproved = parseFloat(sub.score) >= 7;
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                              {sub.usuarios ? sub.usuarios.nombres.charAt(0) : '?'}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {sub.usuarios ? `${sub.usuarios.nombres} ${sub.usuarios.apellidos}` : 'Desconocido'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {sub.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sub.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PREGUNTAS CONFIGURADAS */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Preguntas</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {data.questions.map((q: any, i: number) => (
              <div key={q.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-800 mb-3"><span className="text-blue-500 mr-1">{i + 1}.</span> {q.question_text}</p>
                {q.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
                    <img src={q.image_url} alt="Pregunta" className="h-32 object-contain py-2" />
                  </div>
                )}
                <ul className="space-y-2">
                  {q.options.map((opt: string, optIndex: number) => {
                    const isCorrect = q.correct_option_index === optIndex;
                    return (
                      <li key={optIndex} className={`flex items-start text-sm p-2 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-transparent'}`}>
                        <span className={`mr-2 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-green-500' : 'text-gray-400'}`}>
                          {isCorrect ? '✓' : '•'}
                        </span>
                        <span className={isCorrect ? 'text-green-800 font-medium' : 'text-gray-600'}>
                          {opt}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
