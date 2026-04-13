import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../componets/AuthContext";

const InicioPage = () => {
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleChange = (e) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return;
    }
    setCargando(true);
    // Simular latencia de red
    await new Promise((r) => setTimeout(r, 600));
    const ok = await login(form.email, form.password);
    setCargando(false);
    if (ok) navigate("/home");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Panel izquierdo — branding (NUEVO DISEÑO CON IMAGEN) ── */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative bg-cover bg-center border-r border-slate-800"
        style={{ backgroundImage: "url('/FACULTAD-DE-SALUD-20-scaled.jpeg')" }}
      >
        {/* Filtro oscuro sobre la foto */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Contenedor relativo para el texto */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg">
              🔬
            </div>
            <span className="text-white font-bold text-lg tracking-tight">DermaScan</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Diagnóstico inteligente<br />
              <span className="text-blue-400">al alcance del doctor.</span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Gestiona casos clínicos, analiza lesiones dérmicas y obtén
              sugerencias diagnósticas con apoyo de inteligencia artificial.
            </p>
          </div>

          <div className="flex gap-8 text-slate-300 text-sm">
            <div>
              <p className="text-white font-bold text-2xl">98%</p>
              <p>Precisión del modelo</p>
            </div>
            <div>
              <p className="text-white font-bold text-2xl">+500</p>
              <p>Casos analizados</p>
            </div>
            <div>
              <p className="text-white font-bold text-2xl">24/7</p>
              <p>Disponibilidad</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario (SE MANTIENE IGUAL) ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">🔬</div>
            <span className="text-white font-bold text-base">DermaScan</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Bienvenido de nuevo</h2>
          <p className="text-slate-400 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Correo electrónico
              </label>
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

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-base"
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-1"
            >
              {cargando ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InicioPage;