import React, { useState } from "react";
import { useAuth } from "../componets/AuthContext";
import { useNavigate } from "react-router";

const PerfilPage = () => {
  // Nota: actualizarPerfil lo dejaremos pendiente hasta que quieras cambiar nombre en BD
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Adaptamos los datos para leerlos desde Supabase
  const nombreDoctor = usuario?.user_metadata?.full_name || "Doctor Especialista";
  const fechaRegistro = usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString() : "Reciente";

  const [modo, setModo]     = useState("ver");
  const [form, setForm]     = useState({ nombre: nombreDoctor, email: usuario?.email ?? "" });
  const [guardado, setGuardado] = useState(false);

  if (!usuario) {
    navigate("/inicio");
    return null;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = () => {
    // Aquí iría la lógica para actualizar en Supabase (por ahora simulamos éxito)
    // actualizarPerfil(form);
    setModo("ver");
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleCancelar = () => {
    setForm({ nombre: nombreDoctor, email: usuario.email });
    setModo("ver");
  };

  const handleLogout = () => {
    logout();
    navigate("/inicio");
  };

  // Iniciales para el avatar de Supabase
  const iniciales = nombreDoctor
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ── Topbar simple */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Volver al panel
        </button>
        <span className="text-sm font-semibold text-gray-700">Mi perfil</span>
        <div className="w-24" /> {/* espaciador */}
      </header>

      <div className="flex-1 flex items-start justify-center p-8">
        <div className="w-full max-w-lg flex flex-col gap-5">

          {/* ── Tarjeta avatar */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {iniciales}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{nombreDoctor}</h2>
              <p className="text-sm text-gray-400">{usuario.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Miembro desde {fechaRegistro}
              </p>
            </div>
          </div>

          {/* ── Alerta guardado */}
          {guardado && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
              ✅ Perfil actualizado correctamente. (Nota: Funcionalidad de actualizar en BD pendiente).
            </div>
          )}

          {/* ── Tarjeta datos */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-gray-700">Información de la cuenta</h3>
              {modo === "ver" ? (
                <button
                  onClick={() => setModo("editar")}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  ✏️ Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelar}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    💾 Guardar
                  </button>
                </div>
              )}
            </div>

            {/* ID (solo lectura siempre) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">ID de usuario (Supabase)</label>
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 truncate">
                #{usuario.id}
              </p>
            </div>

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre completo</label>
              {modo === "ver" ? (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{nombreDoctor}</p>
              ) : (
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Correo electrónico</label>
              {modo === "ver" ? (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{usuario.email}</p>
              ) : (
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled // Supabase requiere un flujo especial para cambiar el correo
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed"
                />
              )}
            </div>

            {/* Fecha registro (solo lectura) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha de registro</label>
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                {fechaRegistro}
              </p>
            </div>
          </div>

          {/* ── Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
          >
            Cerrar sesión
          </button>

        </div>
      </div>
    </div>
  );
};

export default PerfilPage;