import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 flex flex-col items-center gap-5 max-w-sm w-full text-center shadow-2xl">
          {/* Icono */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
            🔒
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-1">Acceso restringido</h2>
            <p className="text-sm text-slate-400">
              Necesitas iniciar sesión para ver esta página.
            </p>
          </div>

          <button
            onClick={() => navigate("/inicio")}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
