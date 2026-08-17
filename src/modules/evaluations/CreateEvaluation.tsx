import React, { useState } from 'react';

// Si usas shadcn o componentes locales, puedes importarlos aquí. 
// Por ahora usaré Tailwind básico para asegurar compatibilidad.

export default function CreateEvaluation() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', image_url: '', options: ['', '', '', ''], correct_option_index: 0 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: '', image_url: '', options: ['', '', '', ''], correct_option_index: 0 }
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) return; // Prevent removing the last question
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Guarda la imagen como Base64 para enviarla al backend/Unity
        handleQuestionChange(index, 'image_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token'); // Asume que guardas el JWT aquí
    
    try {
      const response = await fetch('http://localhost:3000/evaluations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, questions })
      });

      if (response.ok) {
        alert('¡Evaluación creada con éxito!');
        setTitle('');
        setDescription('');
        setQuestions([{ question_text: '', image_url: '', options: ['', '', '', ''], correct_option_index: 0 }]);
      } else {
        alert('Error al crear la evaluación');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-10">
      <h1 className="text-2xl font-bold text-gray-800">Crear Nueva Evaluación (VR)</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título de la Evaluación</label>
          <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Ej: Examen de Cardiología" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Instrucciones breves..."></textarea>
        </div>

        <div className="space-y-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Pregunta {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Texto de la Pregunta</label>
                  <input required type="text" value={q.question_text} onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagen (Opcional)</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(qIndex, e)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {q.image_url && <img src={q.image_url} alt="Preview" className="mt-2 h-32 object-contain rounded" />}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex}>
                      <label className="block text-sm font-medium text-gray-700">Opción {['A', 'B', 'C', 'D'][optIndex]}</label>
                      <input required type="text" value={opt} onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Opción Correcta</label>
                  <select value={q.correct_option_index} onChange={e => handleQuestionChange(qIndex, 'correct_option_index', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border p-2 bg-white">
                    <option value={0}>Opción A</option>
                    <option value={1}>Opción B</option>
                    <option value={2}>Opción C</option>
                    <option value={3}>Opción D</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={handleAddQuestion} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            + Añadir otra pregunta
          </button>
          
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold">
            Guardar Evaluación
          </button>
        </div>
      </form>
    </div>
  );
}
