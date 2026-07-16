import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Search, Clock, CheckCircle } from 'lucide-react'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';
import { Spinner } from '@/components/ui/Spinner';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';

export const ConfigView = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const { fetchUsuariosSystem, toggleUserRoleSystem, loading } = useAdmin();

  const syncUsersTable = async () => {
    const data = await fetchUsuariosSystem();
    setUsuarios(data);
  };

  useEffect(() => { syncUsersTable(); }, []);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems: currentUsuarios,
    nextPage,
    prevPage,
  } = usePagination({
    data: usuarios,
    searchFields: ['nombre', 'correo', 'estado'], 
  });


  const handleToggleClick = (id: string, nombre: string, estadoActual: string) => {
    const esActivacion = estadoActual !== 'activo';

    toast.warning(
      esActivacion ? `¿Autorizar acceso a ${nombre}?` : `¿Revocar acceso a ${nombre}?`, 
      {
        description: esActivacion 
          ? 'El docente obtendrá acceso inmediato al panel de administración web.'
          : 'Se suspenderán las credenciales web del docente de manera inmediata.',
        duration: 8000,
        position: 'top-center',
        action: {
          label: esActivacion ? 'Aprobar' : 'Revocar',
          onClick: async () => {
            // Si está activo lo pasa a 'Estudiante' (remover), si está pendiente mantiene 'Docente' (activar)
            const proximoRol = estadoActual === 'activo' ? 'Estudiante' : 'Docente';
            const success = await toggleUserRoleSystem(id, proximoRol);
            
            if (success) {
              if (proximoRol === 'Docente') {
                toast.success('Acceso Autorizado', {
                  description: `El docente ${nombre} ha sido aprobado con éxito.`,
                });
              } else {
                toast.info('Privilegios Revocados', {
                  description: `Se han retirado las credenciales web de ${nombre}.`,
                });
              }
              await syncUsersTable();
            }
          }
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-200">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-[#0b1d33]" />
            Control de Privilegios e Identidad de Personal
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gestione el acceso del personal docente. Active el interruptor para aprobar o desactivar las credenciales clínicas web.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar docente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-[#0b1d33]"
          />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <Spinner message="Sincronizando identidades y permisos del personal autorizado..." />
        ) : (
          <div>
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow>
                  <TableHead className="font-bold text-[#0b1d33]">Usuario</TableHead>
                  <TableHead className="font-bold text-[#0b1d33]">Correo Electrónico</TableHead>
                  <TableHead className="font-bold text-[#0b1d33] text-center w-36">Rol Asignado</TableHead>
                  <TableHead className="font-bold text-[#0b1d33] text-center w-40">Estado de Acceso</TableHead>
                  <TableHead className="font-bold text-[#0b1d33] text-center w-40">Control de Acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400 text-xs font-medium">
                      No se encontraron docentes registrados en el sistema.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="hover:bg-slate-50/40">
                      <TableCell className="font-medium text-slate-700">{usuario.nombre}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{usuario.correo}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            usuario.rol === 'Docente' || usuario.rol === 'DOCENTE' 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold' 
                              : 'bg-blue-50 text-blue-800 border border-blue-200 font-black'
                          }
                        >
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            usuario.estado === 'pendiente'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse font-bold flex items-center gap-1 justify-center w-28 mx-auto'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1 justify-center w-28 mx-auto'
                          }
                        >
                          {usuario.estado === 'pendiente' ? (
                            <>
                              <Clock size={12} />
                              POR VALIDAR
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} />
                              ACTIVO
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {usuario.rol === 'ADMIN' ? (
                            <div className="text-slate-300 p-1">
                              <ShieldAlert size={16} className="mx-auto" />
                            </div>
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={usuario.estado === 'activo'} 
                                onChange={() => handleToggleClick(usuario.id, usuario.nombre, usuario.estado)} 
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b1d33]"></div>
                            </label>
                          )}
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
      </div>
    </div>
  );
};