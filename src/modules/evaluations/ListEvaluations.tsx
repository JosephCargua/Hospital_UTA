import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ListEvaluations() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchEvaluations();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando evaluaciones...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mis Evaluaciones</h1>
        <button 
          onClick={() => navigate('/dashboard/evaluations/create')} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Crear Nueva
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
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No has creado evaluaciones aún.</td>
              </tr>
            ) : (
              evaluations.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ev.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ev.semestre || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ev.paralelo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ev.submissions_count} / {ev.total_students > 0 ? ev.total_students : '?'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ev.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ev.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/dashboard/evaluations/${ev.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalle
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
