import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router"; // <-- Importaciones correctas
import { AuthProvider } from "./componets/AuthContext";
import { CasosProvider } from "./componets/CasosContext";
import ProtectedRoute from "./componets/ProtectedRoute";

// Páginas y Componentes
import InicioPage from "./pages/InicioPage";
import RegistroPage from "./pages/RegistroPage";
import PerfilPage from "./pages/PerfilPage";
import Sidebar from "./componets/Sidebar";
import UploadForm from "./componets/UploadForm";
import DiagnosisPanel from "./componets/DiagnosisPanel";

// Este es el layout principal de tu aplicación (la pantalla dividida en columnas)
const HomeLayout = () => {
  return (
    <div className="grid grid-cols-12 gap-4 p-6 min-h-screen bg-slate-50">
      {/* Puedes ajustar las columnas según lo tenías originalmente */}
      <Sidebar />
      <UploadForm />
      <DiagnosisPanel />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CasosProvider>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/inicio" element={<InicioPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            
            {/* Rutas Protegidas (Solo para doctores logueados) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomeLayout />} />
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/inicio" />} />
          </Routes>
        </CasosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}