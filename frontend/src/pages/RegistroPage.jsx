import React, { useState } from "react";
import { useNavigate, Link } from "react-router"; // O react-router-dom dependiendo de tu versión
import { useAuth } from "../componets/AuthContext";

const RegistroPage = () => {
  const { registro, error, setError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  const handleChange = (e) => {
    setError(null);
    setErrorLocal(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmar) {
      setErrorLocal("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 6) {
      setErrorLocal("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    await new Promise((r) => setTimeout(r, 600)); 
    
    const ok = await registro(form.nombre, form.email, form.password); 
    
    setCargando(false);
    if (ok) navigate("/home");
  };

  const mensajeError = errorLocal || error;

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Panel izquierdo — branding (NUEVO DISEÑO CON IMAGEN) ── */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative bg-cover bg-center border-r border-slate-800"
        style={{ backgroundImage: "url('/FACULTAD-DE-SALUD-20-scaled.jpeg')" }}
      >
        {/* Filtro oscuro sobre la foto para que el texto blanco se lea perfecto */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Contenedor relativo para que el texto quede por encima del filtro oscuro */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg">
              🔬
            </div>
            <span className="text-white font-bold text-lg tracking-tight">DermaScan</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Crea tu cuenta<br />
              <span className="text-blue-400">y empieza a diagnosticar.</span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Únete a la plataforma de diagnóstico dermatológico asistido por IA.
              Gestiona tus pacientes y casos clínicos desde un solo lugar.
            </p>
          </div>

          <ul className="flex flex-col gap-3 text-slate-300 text-sm">
            {["Acceso a historial completo de pacientes", "Panel de diagnóstico con IA integrada", "Gestión de imágenes dermatológicas"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-blue-500 text-base">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Panel derecho — formulario (SE MANTIENE IGUAL DE GENIAL) ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">🔬</div>
            <span className="text-white font-bold text-base">DermaScan</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Crear cuenta</h2>
          <p className="text-slate-400 text-sm mb-8">Completa el formulario para registrarte</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Dr. Juan Pérez"
                required
                className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@ejemplo.com"
                required
                className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Confirmar contraseña</label>
              <input
                type={mostrarPassword ? "text" : "password"}
                name="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {mensajeError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {mensajeError}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-1"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/inicio" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistroPage;