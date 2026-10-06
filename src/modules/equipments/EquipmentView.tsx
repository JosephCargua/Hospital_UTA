import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Layers, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMedicalEquipment } from '@/hooks/useMedicalEquipment';
import { useRooms } from '@/hooks/useRooms';
import ActionButton from '@/components/ui/ActionButton';
import GenericModal, { FormField } from '@/components/ui/GenericModal';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';

const UNITY_EQUIPMENT_NODES = [
  { value: 'CamaUCI', label: 'Cama Clínica UCI' },
  { value: 'SoporteUCI', label: 'Soporte de Equipos' },
  { value: 'MonitorUCI', label: 'Monitor de Signos Vitales' },
  { value: 'CarroDeParoUCI', label: 'Carro de Paro / Reanimación' },
  { value: 'BombasInfucionUCI', label: 'Bombas de Infusión' },
  { value: 'VentiladorMecanicoUCI', label: 'Ventilador Mecánico' },
  // 🚀 VARIANTES EXTRAS PARA PRUEBAS (Evitan el error de llave duplicada 23505)
  { value: 'EquipoPrueba1', label: 'Equipo de Prueba 1' },
  { value: 'EquipoPrueba2', label: 'Equipo de Prueba 2' },
];

export const EquipmentView = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const { fetchEquipmentSystem, createEquipmentSystem, updateEquipmentSystem, deleteEquipmentSystem, loadingEquipment } = useMedicalEquipment();
  const { fetchRoomsSystem } = useRooms();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, initialValues: {}, isEdit: false });

  const syncData = async () => {
    const [listEq, listRm] = await Promise.all([fetchEquipmentSystem(), fetchRoomsSystem()]);
    setEquipment(listEq);
    setRooms(listRm);
  };

  useEffect(() => { syncData(); }, []);

  // 🚀 INTEGRACIÓN DEL HOOK DE PAGINACIÓN GENÉRICO
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems: currentEquipment,
    nextPage,
    prevPage,
  } = usePagination({
    data: equipment,
    searchFields: ['nombre', 'unity_tag'], // Filtra por nombre u objeto 3D
  });

  const openModal = (item?: any) => {
    setModalConfig({
      isOpen: true,
      isEdit: !!item,
      initialValues: item ? {
        roomId: item.sala_id,
        unityTag: item.unity_tag,
        name: item.nombre,
        description: item.descripcion
      } : { roomId: '', unityTag: '', name: '', description: '' }
    });
  };
  const handleSave = async (values: Record<string, any>) => {
    // 1. Validaciones manuales de seguridad en la UI
    if (!values.roomId) {
      toast.warning('Campos Incompletos', { description: 'Por favor, seleccione una sala de ubicación para el equipo.' });
      return false;
    }
    if (!values.name || values.name.trim() === '') {
      toast.warning('Campos Incompletos', { description: 'El nombre clínico del equipo es obligatorio.' });
      return false;
    }
    if (!values.description || values.description.trim() === '') {
      toast.warning('Campos Incompletos', { description: 'La descripción teórica para el Canvas VR no puede estar vacía.' });
      return false;
    }

    // Extracción y saneamiento de propiedades comunes
    const cleanRoomId = Number(values.roomId);
    const cleanName = values.name.trim();
    const cleanDescription = values.description.trim();

    let result: { success: boolean; error?: string };

    if (modalConfig.isEdit) {
      const originalUnityTag = (modalConfig.initialValues as any).unityTag;

      // 🚀 Consumimos la nueva respuesta estructurada del hook
      result = await updateEquipmentSystem(
        cleanRoomId,
        originalUnityTag,
        cleanName,
        cleanDescription
      );
    } else {
      const selectedUnityTag = values.unityTag || (modalConfig.initialValues as any).unityTag;

      if (!selectedUnityTag || selectedUnityTag.trim() === '') {
        toast.warning('Campos Incompletos', { description: 'Debe seleccionar un objeto 3D de la escena de Unity.' });
        return false;
      }

      // 🚀 Consumimos la nueva respuesta estructurada del hook
      result = await createEquipmentSystem(
        cleanRoomId,
        selectedUnityTag.trim(),
        cleanName,
        cleanDescription
      );
    }

    // 🚀 CONTROLADOR DE NOTIFICACIONES DINÁMICAS
    if (result.success) {
      toast.success(modalConfig.isEdit ? 'Equipo actualizado con éxito' : 'Nuevo equipo catalogado con éxito');
      await syncData();
      return true; // Cierra el modal genérico
    } else {
      // Si la base de datos rebota la transacción (ej: error 23505), mostramos la advertencia exacta
      toast.error('Operación rechazada', {
        description: result.error || 'No se pudieron consolidar los cambios en el catálogo.',
        duration: 5000
      });
      return false; // Mantiene el modal abierto para que el docente corrija el campo
    }
  };

  const currentFields: FormField[] = [
    { name: 'roomId', label: 'Sala de Ubicación', type: 'select', required: true, options: rooms.map(r => ({ value: r.id, label: r.nombre })) },
    { name: 'unityTag', label: 'Vincular Objeto 3D (Escena Unity)', type: 'select', required: true, options: UNITY_EQUIPMENT_NODES, disabled: modalConfig.isEdit },
    { name: 'name', label: 'Nombre del Equipo (Título Canvas)', type: 'text', placeholder: 'Ej: Monitor Multiparámetro', required: true },
    { name: 'description', label: 'Guía Pedagógica (Contenido Canvas VR)', type: 'textarea', placeholder: 'Escribe la descripción teórica...', required: true }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Catálogo de Equipos Médicos Interactuables</h3>
          <p className="text-xs text-slate-500">Administración teórica sincrónica para el simulador virtual.</p>
        </div>

        {/* 🚀 BARRA DE BÚSQUEDA EN EQUIPOS */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar equipo médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-[#0b1d33]"
            />
          </div>
          <ActionButton onClick={() => openModal()} label="Agregar Equipo" icon={Plus} />
        </div>
      </div>

      {loadingEquipment ? (
        <Spinner message="Sincronizando el catálogo de instrumental biomédico..." />
      ) : (
        <div className="pt-2">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-[#0b1d33]">Equipo</TableHead>
                <TableHead className="font-bold text-[#0b1d33]">Sala Relacionada</TableHead>
                <TableHead className="font-bold text-[#0b1d33]">Unity Tag Match</TableHead>
                <TableHead className="text-center font-bold text-[#0b1d33] w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No se encontraron equipos biomédicos en esta página.
                  </TableCell>
                </TableRow>
              ) : (
                currentEquipment.map(item => (
                  <TableRow key={item.id} className="hover:bg-slate-50/40">
                    <TableCell className="font-medium text-slate-700">{item.nombre}</TableCell>
                    <TableCell><Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 font-bold text-xs">{item.salas?.nombre || 'General'}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-amber-700 bg-amber-50/50 px-2 py-1 rounded w-fit">{item.unity_tag}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal(item)} className="text-slate-600"><Pencil size={15} /></Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.warning(`¿Eliminar ${item.nombre}?`, { action: { label: 'Eliminar', onClick: async () => { if (await deleteEquipmentSystem(item.id)) await syncData(); } } });
                        }} className="text-red-500"><Trash2 size={15} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 🚀 CONTROLES COMPARTIDOS */}
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
        title="Ficha de Equipo"
        description="Completa el formulario para actualizar la información pedagógica del gemelo digital."
        icon={Layers}
        fields={currentFields}
        initialValues={modalConfig.initialValues}
        onSave={handleSave}
      />
    </div>
  );
};
