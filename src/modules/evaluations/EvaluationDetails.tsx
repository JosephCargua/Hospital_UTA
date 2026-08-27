import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EvaluationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Evaluación no encontrada.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-8 mt-10">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          &larr; Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Detalle de Evaluación: {data.title}</h1>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p><strong>Descripción:</strong> {data.description}</p>
        <p><strong>Semestre:</strong> {data.semestre || 'N/A'}</p>
        <p><strong>Paralelo:</strong> {data.paralelo || 'N/A'}</p>
        <p><strong>Estado:</strong> {data.is_active ? 'Activa' : 'Finalizada'}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Preguntas Configuradas</h2>
        <div className="space-y-4">
          {data.questions.map((q: any, i: number) => (
            <div key={q.id} className="border p-4 rounded-md">
              <p className="font-semibold">{i + 1}. {q.question_text}</p>
              {q.image_url && <img src={q.image_url} alt="Pregunta" className="h-20 my-2 rounded" />}
              <ul className="mt-2 ml-4 list-disc space-y-1">
                {q.options.map((opt: string, optIndex: number) => (
                  <li key={optIndex} className={q.correct_option_index === optIndex ? "text-green-600 font-bold" : "text-gray-600"}>
                    {opt} {q.correct_option_index === optIndex && "(Correcta)"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Envíos de Estudiantes ({data.submissions?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota (sobre 10)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.submissions?.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Ningún estudiante ha respondido aún.</td></tr>
              ) : (
                data.submissions?.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.usuarios ? `${sub.usuarios.nombres} ${sub.usuarios.apellidos}` : 'Usuario Desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{sub.score} / 10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
