import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Función para redimensionar y comprimir la imagen en el navegador
// Reduce fotos de 5MB-10MB a menos de 100KB preservando nitidez para Web y VR
const compressImage = (file: File, maxDimension = 1000, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Comprime a formato JPEG con calidad optimizada
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
  });
};

export default function CreateEvaluation() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [semestre, setSemestre] = useState('');
  const [paralelo, setParalelo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        handleQuestionChange(index, 'image_url', compressedBase64);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error al procesar la imagen');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    handleQuestionChange(index, 'image_url', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = localStorage.getItem('token'); // Asume que guardas el JWT aquí
    
    try {
      const response = await fetch('https://hospital-uta-backend-fu3b.onrender.com/evaluations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, semestre, paralelo, questions })
      });

      if (response.ok) {
        toast.success('¡Evaluación creada con éxito!');
        navigate('/dashboard/evaluations'); // Redirect to list
      } else {
        const errorData = await response.json().catch(() => null);
        if (response.status === 413) {
          toast.error('Las imágenes seleccionadas exceden el límite de tamaño permitido por el servidor (Error 413).');
        } else {
          toast.error(errorData?.message || 'Error al crear la evaluación');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Semestre</label>
            <select required value={semestre} onChange={e => setSemestre(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
              <option value="" disabled>Seleccionar Semestre</option>
              <option value="6to">6to</option>
              <option value="7mo">7mo</option>
              <option value="8vo">8vo</option>
              <option value="9no">9no</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Paralelo</label>
            <select required value={paralelo} onChange={e => setParalelo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
              <option value="" disabled>Seleccionar Paralelo</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
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
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleImageUpload(qIndex, e)} 
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  {q.image_url && (
                    <div className="relative inline-block mt-3 border rounded-lg p-1 bg-white shadow-sm">
                      <img src={q.image_url} alt="Preview" className="h-32 object-contain rounded" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(qIndex)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-700"
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  )}
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

        <div className="flex justify-between items-center">
          <button type="button" onClick={handleAddQuestion} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            + Añadir otra pregunta
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-6 py-2 rounded text-white font-bold transition ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </div>
      </form>
    </div>
  );
}
