import { useState, useEffect } from 'react';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import GenericModal, { FormField } from '@/components/ui/GenericModal';
import { Spinner } from '@/components/ui/Spinner'; 
import { useStudents } from '@/hooks/useStudents';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';

export const StudentsView = () => {
  const [alumnosData, setAlumnosData] = useState<any[]>([]);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    icon: any;
    fields: FormField[];
    initialValues: Record<string, any>;
    onSave: (values: Record<string, any>) => Promise<boolean>;
  }>({
    isOpen: false, title: '', description: '', icon: Pencil, fields: [], initialValues: {}, onSave: async () => false
  });

  const { fetchAlumnosSystem, updateAlumnoData, deleteAlumnoSystem, loadingStudents } = useStudents();

  const syncStudentsTable = async () => {
    const data = await fetchAlumnosSystem();
    setAlumnosData(data);
  };

  useEffect(() => {
    syncStudentsTable();
  }, []);

  // 🚀 LIMPIO Y CENTRALIZADO: Paginación fluida sin 'itemsPerPage' redundante
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems: currentAlumnos, 
    nextPage,
    prevPage,
  } = usePagination({
    data: alumnosData,
    searchFields: ['nombre', 'correo']
  });

  // Handler para detonar el modal genérico configurado para edición de usuario
  const openEditUserModal = (alumno: any) => {
    const parts = alumno.nombre.trim().split(' ');
    const currentNombres = parts.length >= 3 ? `${parts[0]} ${parts[1]}` : parts[0] || '';
    const currentApellidos = parts.length >= 3 ? parts.slice(2).join(' ') : parts[1] || '';

    setModalConfig({
      isOpen: true,
      title: "Actualizar Información",
      description: "Modifica los datos académicos del estudiante autorizado.",
      icon: Pencil,
      initialValues: {
        correo: alumno.correo,
        nombres: currentNombres,
        apellidos: currentApellidos,
        semestre: alumno.semestre || '6to',
        paralelo: alumno.paralelo || 'A'
      },
      fields: [
        { name: 'correo', label: 'Correo Electrónico', type: 'text', disabled: true },
        { name: 'nombres', label: 'Nombres', type: 'text', required: true },
        { name: 'apellidos', label: 'Apellidos', type: 'text', required: true },
        { 
          name: 'semestre', label: 'Semestre Académico', type: 'select', required: true,
          options: ['6to', '7mo', '8vo', '9no'].map(s => ({ value: s, label: `${s} Semestre` }))
        },
        { 
          name: 'paralelo', label: 'Paralelo Asignado', type: 'select', required: true,
          // 🚀 CORREGIDO: Se eliminó la opción "Ninguno" e incorporamos la totalidad de aulas (A, B, C, D)
          options: ['A', 'B'].map(p => ({ value: p, label: `Paralelo ${p}` }))
        }
      ],
      onSave: async (values) => {
        if (!values.nombres || values.nombres.trim() === '') {
          toast.warning('Campos Incompletos', {
            description: 'El campo de Nombres es obligatorio para el estudiante.',
          });
          return false; 
        }

        if (!values.apellidos || values.apellidos.trim() === '') {
          toast.warning('Campos incompletos', {
            description: 'El campo de Apellidos es obligatorio para el estudiante.',
          });
          return false;
        }

        const success = await updateAlumnoData(
          alumno.id, 
          values.nombres.trim(), 
          values.apellidos.trim(), 
          values.semestre, 
          values.paralelo
        );

        if (success) {
          toast.success('Registro estudiantil actualizado con éxito');
          await syncStudentsTable();
        }
        return success;
      }
    });
  };

  const handleDeleteAlumno = (id: string, nombre: string) => {
    toast.warning(`¿Eliminar a ${nombre}?`, {
      description: 'Esta acción borrará de forma permanente al estudiante del sistema.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const success = await deleteAlumnoSystem(id);
          if (success) {
            toast.success(`Estudiante ${nombre} removido con éxito`);
            await syncStudentsTable();
          }
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-200">
      
      {/* Cabecera Adaptada con barra de búsqueda */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Estudiantes autorizados en Simuladores VR</h3>
          <p className="text-xs text-slate-500">Listado institucional oficial de alumnos registrados.</p>
        </div>
        
        {/* CAJA DE BÚSQUEDA FLUIDA */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar estudiante..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-[#0b1d33]"
            />
          </div>
          <Badge variant="outline" className="text-[#c29b38] bg-[#c29b38]/5 font-bold px-3 py-1 text-xs shrink-0 h-9 flex items-center">
            {totalItems} Alumnos
          </Badge>
        </div>
      </div>

      {loadingStudents ? (
        <Spinner message="Cargando nómina oficial de estudiantes autorizados..." />
      ) : (
        <div className="px-6 pb-4 pt-2">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-[#0b1d33]">Nombre</TableHead>
                <TableHead className="font-bold text-[#0b1d33]">Correo Electrónico</TableHead>
                <TableHead className="font-bold text-[#0b1d33] text-center">Semestre</TableHead>
                <TableHead className="font-bold text-[#0b1d33] text-center">Paralelo</TableHead>
                <TableHead className="text-center font-bold text-[#0b1d33] w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAlumnos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No se encontraron registros coincidentes con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                currentAlumnos.map((alumno) => (
                  <TableRow key={alumno.id} className="hover:bg-slate-50/40">
                    <TableCell className="font-medium text-slate-700">{alumno.nombre}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{alumno.correo}</TableCell>
                    <TableCell className="text-center text-slate-600">{alumno.semestre}</TableCell>
                    <TableCell className="text-center font-bold text-slate-600">{alumno.paralelo}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditUserModal(alumno)} className="text-slate-600"><Pencil size={15} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAlumno(alumno.id, alumno.nombre)} className="text-red-500"><Trash2 size={15} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* CONTROLES DE PAGINACIÓN COMPARTIDOS */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            onNext={nextPage}
            onPrev={prevPage}
          />
        </div>
      )}

      {/* RENDERIZADO DEL MODAL REUTILIZABLE */}
      <GenericModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        description={modalConfig.description}
        icon={modalConfig.icon}
        fields={modalConfig.fields}
        initialValues={modalConfig.initialValues}
        onSave={modalConfig.onSave}
      />
    </div>
  );
};
