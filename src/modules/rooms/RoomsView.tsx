import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Layout, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRooms } from '@/hooks/useRooms';
import ActionButton from '@/components/ui/ActionButton';
import GenericModal, { FormField } from '@/components/ui/GenericModal';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';

export const RoomsView = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const { fetchRoomsSystem, createRoomSystem, updateRoomSystem, deleteRoomSystem, loadingRooms } = useRooms();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, initialValues: {}, isEdit: false });

  const syncData = async () => { setRooms(await fetchRoomsSystem()); };
  useEffect(() => { syncData(); }, []);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems: currentRooms,
    nextPage,
    prevPage,
  } = usePagination({
    data: rooms,
    searchFields: ['nombre', 'descripcion'], 
  });

  const openModal = (room?: any) => {
    setModalConfig({
      isOpen: true,
      isEdit: !!room,
      initialValues: room ? { 
        id: room.id, 
        name: room.nombre, 
        description: room.descripcion 
      } : { id: null, name: '', description: '' }
    });
  };

  const handleSave = async (values: Record<string, any>) => {
    if (!values.name || values.name.trim() === '') {
      toast.warning('Información requerida', { description: 'El nombre de la sala no puede estar vacío.' });
      return false; 
    }
    if (!values.description || values.description.trim() === '') {
      toast.warning('Información Requerida', { description: 'La Descripción de la Sala es Obligatoria.' });
      return false; 
    }

    let result: { success: boolean; error?: string };

    if (modalConfig.isEdit) {
      const roomId = (modalConfig.initialValues as any).id;
      result = await updateRoomSystem(roomId, values.name.trim(), values.description.trim());
    } else {
      result = await createRoomSystem(values.name.trim(), values.description.trim());
    }

    if (result.success) {
      toast.success(modalConfig.isEdit ? 'Sala modificada con éxito' : 'Nueva Sala Agregada');
      await syncData();
      return true;
    } else {
      toast.error('Operación fallida', {
        description: result.error || 'No se pudieron consolidar los cambios de la sala clínica.',
        duration: 5000
      });
      return false;
    }
  };

  const handleDelete = async (id: number, name: string) => {
    toast.warning(`¿Eliminar la sala ${name}?`, {
      description: 'Esta acción removerá el entorno clínico del sistema virtual de forma permanente.',
      action: { 
        label: 'Eliminar', 
        onClick: async () => { 
          // Consumimos el objeto estructurado devuelto por el hook blindado
          const result = await deleteRoomSystem(id);

          if (result.success) {
            toast.success(`La sala "${name}" fue eliminada correctamente`);
            await syncData(); 
          } else {
            // Levantamos la alerta roja si NestJS rebotó el borrado por la restricción de conteo de equipos
            toast.error('Borrado Cancelado', {
              description: result.error,
              duration: 6000
            });
          }
        } 
      }
    });
  };

  const fields = [
    { name: 'name', label: 'Nombre del Entorno', type: 'text', placeholder: 'Ej: Quirófano General A', required: true },
    { name: 'description', label: 'Descripción / Contexto Clínico', type: 'textarea', placeholder: 'Ingresa los detalles teóricos...', required: true }
  ] as FormField[]; 

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Entornos Virtuales Disponibles</h3>
          <p className="text-xs text-slate-500">Gestión de Salas Virtuales.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar sala médica..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-[#0b1d33]"
            />
          </div>
          <ActionButton onClick={() => openModal()} label="Agregar Sala" icon={Plus} />
        </div>
      </div>

      {loadingRooms ? (
        <Spinner message="Sincronizando entornos clínicos con la base de datos..." />
      ) : (
        <div className="pt-2">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Sala Médica</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No se encontraron entornos clínicos que coincidan.
                  </TableCell>
                </TableRow>
              ) : (
                currentRooms.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-bold text-xs text-slate-400">{r.id}</TableCell>
                    <TableCell className="font-semibold text-[#0b1d33]">{r.nombre}</TableCell>
                    <TableCell className="text-xs text-slate-500">{r.descripcion || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal(r)} className="text-slate-600"><Pencil size={15} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id, r.nombre)} className="text-red-500"><Trash2 size={15} /></Button>
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
        title={modalConfig.isEdit ? "Modificar Sala Médica" : "Registrar Nueva Sala"}
        description="Ingresa los datos correspondientes del espacio."
        icon={Layout}
        fields={fields}
        initialValues={modalConfig.initialValues}
        onSave={handleSave}
      />
    </div>
  );
};
