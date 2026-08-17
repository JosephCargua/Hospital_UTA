import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '@/modules/auth/SignInPage';
import SignUpPage from '@/modules/auth/SignUpPage';
import ForgotPasswordPage from '@/modules/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/modules/auth/ResetPasswordPage'; 

// Importación de las nuevas vistas modularizadas
import HomeLayout from './layout/HomeLayout'; 
import { StudentsView } from './modules/students/StudentsView';
import { RoomsView } from './modules/rooms/RoomsView';
import { EquipmentView } from './modules/equipments/EquipmentView';
import { Toaster } from 'sonner'; 
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { ConfigView } from './modules/admin/ConfigView';
import CreateEvaluation from './modules/evaluations/CreateEvaluation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ======================================================= */}
        {/* RUTAS PROTEGIDAS ANIDADAS CON PREFIJO /DASHBOARD         */}
        {/* ======================================================= */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCENTE']} />}>
          <Route path="/dashboard" element={<HomeLayout />}>
            {/* Si entra a /dashboard seco, redirige por defecto a students */}
            <Route index element={<Navigate to="students" replace />} />
            
            {/* Rutas Hijas Reales */}
            <Route path="students" element={<StudentsView />} />
            <Route path="rooms" element={<RoomsView />} />
            <Route path="equipment" element={<EquipmentView />} />
            <Route path="settings" element={<ConfigView />} />
            <Route path="evaluations" element={<CreateEvaluation />} />
          </Route>
        </Route>

        {/* Simulador Estudiantes */}
        <Route element={<ProtectedRoute allowedRoles={['ESTUDIANTE']} />}>
          <Route path="/simulador" element={
            <div className="min-h-screen bg-[#0b1d33] text-white flex flex-col items-center justify-center p-6">
              <h1 className="text-3xl font-black text-[#c29b38] mb-2">ENTORNO DE SIMULACIÓN CLÍNICA</h1>
              <p className="text-slate-300 text-sm">Cargando módulos de Realidad Virtual para Enfermería...</p>
            </div>
          } />
        </Route>

        {/* 404 Control */}
        <Route path="*" element={
          <div className="min-h-screen bg-[#0b1d33] flex flex-col items-center justify-center text-white font-bold">
            <h2 className="text-4xl text-red-500 mb-2">404</h2>
            <p className="text-lg text-slate-400">Recurso institucional no encontrado</p>
          </div>
        } />
      </Routes>
      <Toaster richColors position="top-center" closeButton />
    </BrowserRouter>
  );
}

export default App;