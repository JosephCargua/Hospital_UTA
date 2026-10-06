import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Users, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePatients } from '@/hooks/usePatients';
import ActionButton from '@/components/ui/ActionButton';
import GenericModal, { FormField } from '@/components/ui/GenericModal';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';

export const PatientsView = () => {
  const [patients, setPatients] = useState<any[]>([]);

  const { fetchPatientsSystem, createPatientSystem, updatePatientSystem, deletePatientSystem, loadingPatients } = usePatients();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, initialValues: {}, isEdit: false });

  const syncData = async () => {
    const listPts = await fetchPatientsSystem();
    setPatients(listPts);
  };

  useEffect(() => { syncData(); }, []);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems: currentPatients,
    nextPage,
    prevPage,
  } = usePagination({
    data: patients,
    searchFields: ['nombre', 'unity_tag'], 
  });

  const openModal = (item?: any) => {
    setModalConfig({
      isOpen: true,
      isEdit: !!item,
      initialValues: item ? {
        id: item.id,
        unityTag: item.unity_tag,
        name: item.nombre,
        description: item.descripcion
      } : { unityTag: '', name: '', description: '' }
    });
  };

  const handleSave = async (values: Record<string, any>) => {
    if (!values.name || values.name.trim() === '') {
      toast.warning('Campos Incompletos', { description: 'El nombre del paciente es obligatorio.' });
      return false;
    }
    if (!values.description || values.description.trim() === '') {
      toast.warning('Campos Incompletos', { description: 'La descripción para el entorno VR no puede estar vacía.' });
      return false;
    }
    if (!values.unityTag || values.unityTag.trim() === '') {
      toast.warning('Campos Incompletos', { description: 'Debe proporcionar un identificador Unity Tag.' });
      return false;
    }

    const cleanName = values.name.trim();
    const cleanDescription = values.description.trim();
    const cleanUnityTag = values.unityTag.trim();

    let result: { success: boolean; error?: string };

    if (modalConfig.isEdit) {
      const id = (modalConfig.initialValues as any).id;
      result = await updatePatientSystem(id, cleanUnityTag, cleanName, cleanDescription);
    } else {
      result = await createPatientSystem(cleanUnityTag, cleanName, cleanDescription);
    }

    if (result.success) {
      toast.success(modalConfig.isEdit ? 'Paciente actualizado con éxito' : 'Nuevo paciente registrado con éxito');
      await syncData();
      return true; 
    } else {
      toast.error('Operación rechazada', {
        description: result.error || 'No se pudieron consolidar los cambios.',
        duration: 5000
      });
      return false; 
    }
  };

  const currentFields: FormField[] = [
    { name: 'unityTag', label: 'Unity Tag (Identificador en Unity)', type: 'text', placeholder: 'Ej: Paciente_Interactivo', required: true },
    { name: 'name', label: 'Nombre del Paciente', type: 'text', placeholder: 'Ej: Juan Pérez', required: true },
    { name: 'description', label: 'Descripción (Diagnóstico, Estado, etc.)', type: 'textarea', placeholder: 'Escribe el diagnóstico y signos vitales...', required: true }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Gestión de Pacientes (UCI VR)</h3>
          <p className="text-xs text-slate-500">Administración de pacientes para simulaciones de realidad virtual.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-[#0b1d33]"
            />
          </div>
          <ActionButton onClick={() => openModal()} label="Agregar Paciente" icon={Plus} />
        </div>
      </div>

      {loadingPatients ? (
        <Spinner message="Sincronizando el registro de pacientes..." />
      ) : (
        <div className="pt-2">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-[#0b1d33]">Paciente</TableHead>
                <TableHead className="font-bold text-[#0b1d33]">Unity Tag Match</TableHead>
                <TableHead className="text-center font-bold text-[#0b1d33] w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No se encontraron pacientes en esta página.
                  </TableCell>
                </TableRow>
              ) : (
                currentPatients.map(item => (
                  <TableRow key={item.id} className="hover:bg-slate-50/40">
                    <TableCell className="font-medium text-slate-700">{item.nombre}</TableCell>
                    <TableCell className="font-mono text-xs text-amber-700 bg-amber-50/50 px-2 py-1 rounded w-fit">{item.unity_tag}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal(item)} className="text-slate-600"><Pencil size={15} /></Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.warning(`¿Eliminar ${item.nombre}?`, { action: { label: 'Eliminar', onClick: async () => { if (await deletePatientSystem(item.id)) await syncData(); } } });
                        }} className="text-red-500"><Trash2 size={15} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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

      <GenericModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(p => ({ ...p, isOpen: false }))}
        title="Ficha de Paciente"
        description="Completa el formulario para la información del paciente en VR."
        icon={Users}
        fields={currentFields}
        initialValues={modalConfig.initialValues}
        onSave={handleSave}
      />
    </div>
  );
};
