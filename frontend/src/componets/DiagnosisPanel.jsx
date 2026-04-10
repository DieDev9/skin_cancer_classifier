import React, { useState, useEffect, useRef } from "react";
import { useCasos } from "./CasosContext";
import { createClient } from "@supabase/supabase-js";

// <-- NUEVO: Inicializar Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// ── Barra de probabilidad
const ProbabilidadBar = ({ valor, clasificacion }) => {
  const color =
    clasificacion === "Maligno"       ? "bg-red-500"
    : clasificacion === "Benigno"     ? "bg-green-500"
    : "bg-yellow-400";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Probabilidad</span>
        <span className="font-bold text-gray-700">{valor ?? "—"}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${valor ?? 0}%` }}
        />
      </div>
    </div>
  );
};

// ── Badge clasificación
const ClasificacionBadge = ({ clasificacion }) => {
  const estilos = {
    Maligno:       "bg-red-100 text-red-700 border-red-200",
    Benigno:       "bg-green-100 text-green-700 border-green-200",
    "Sin clasificar": "bg-gray-100 text-gray-500 border-gray-200",
  };
  const iconos = { Maligno: "⚠️", Benigno: "✅", "Sin clasificar": "❓" };

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full border ${estilos[clasificacion] ?? estilos["Sin clasificar"]}`}>
      {iconos[clasificacion]} {clasificacion}
    </span>
  );
};

// ── Miniatura del historial de imágenes
const ImagenThumb = ({ imagen, activa, onClick }) => (
  <button
    onClick={onClick}
    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0
      ${activa ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
  >
    <img src={imagen.url} alt={imagen.fecha} className="w-full h-full object-cover" />
  </button>
);

// ────────────────────────────────────────────
const DiagnosisPanel = () => {
  const { casoSeleccionado, guardarDiagnostico, agregarImagen } = useCasos();

  const [modo, setModo]           = useState("ver");   // "ver" | "editar"
  const [form, setForm]           = useState({});
  const [imagenActiva, setImagenActiva] = useState(null);
  const fileInputRef              = useRef(null);
  const [notificacion, setNotificacion] = useState(null);
  
  // --- NUEVO ESTADO PARA EL MODAL DE IMAGEN ---
  const [mostrarModal, setMostrarModal] = useState(false);

  // Sincronizar cuando cambia el caso
  useEffect(() => {
    if (casoSeleccionado) {
      setForm({
        descripcionLesion:    casoSeleccionado.descripcionLesion    ?? "",
        clasificacion:        casoSeleccionado.clasificacion        ?? "Sin clasificar",
        probabilidad:         casoSeleccionado.probabilidad         ?? "",
        fechaDiagnostico:     casoSeleccionado.fechaDiagnostico      ?? "",
        diagnosticoConfirmado: casoSeleccionado.diagnosticoConfirmado ?? false,
      });
      setImagenActiva(casoSeleccionado.imagenPrincipal ?? null);
      setModo("ver");
    }
  }, [casoSeleccionado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

const handleGuardar = async () => {
    try {
      // 1. Verificamos que tengamos al paciente correcto seleccionado
      if (!casoSeleccionado || !casoSeleccionado.id) {
        setNotificacion({ tipo: "error", texto: "No hay un paciente activo." });
        setTimeout(() => setNotificacion(null), 4000);
        return;
      }

      // 2. Empaquetamos los datos
      const nuevoDiagnostico = {
        paciente_id: casoSeleccionado.id, 
        imagen_url: imagenActiva,
        clasificacion: form.clasificacion,
        probabilidad: parseFloat(form.probabilidad) || 0,
        descripcion_medico: form.descripcionLesion || "Sin observaciones",
        diagnostico_confirmado: form.diagnosticoConfirmado || false,
        fecha_diagnostico: form.fechaDiagnostico || new Date().toISOString().slice(0, 10)
      };

      // 3. Enviamos a Supabase
      const { error } = await supabase
        .from("Diagnostico")
        .insert(nuevoDiagnostico);

      if (error) throw error;

      // 4. ¡Éxito! Quitamos el alert feo y usamos tu notificación flotante
      setModo("ver");
      setNotificacion({ tipo: "exito", texto: "¡Historial guardado correctamente!" });
      
      // Ocultamos la notificación automáticamente después de 4 segundos
      setTimeout(() => setNotificacion(null), 4000);

    } catch (error) {
      console.error("Error al guardar diagnóstico en BD:", error);
      setNotificacion({ tipo: "error", texto: "Hubo un problema al guardar." });
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  const handleCancelar = () => {
    setForm({
      descripcionLesion:     casoSeleccionado.descripcionLesion    ?? "",
      clasificacion:         casoSeleccionado.clasificacion        ?? "Sin clasificar",
      probabilidad:          casoSeleccionado.probabilidad         ?? "",
      fechaDiagnostico:      casoSeleccionado.fechaDiagnostico      ?? "",
      diagnosticoConfirmado: casoSeleccionado.diagnosticoConfirmado ?? false,
    });
    setModo("ver");
  };

// Subir imagen a Supabase Storage y consultar a la IA
  const handleSubirImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // --- 1. SUBIR A SUPABASE ---
      const fileExt = file.name.split('.').pop();
      const fileName = `${casoSeleccionado.id}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('imagenes_lunares')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes_lunares')
        .getPublicUrl(fileName);

      const nueva = { 
        id: Date.now(), 
        url: publicUrl, 
        fecha: new Date().toISOString().slice(0, 10), 
        esLocal: false 
      };
      
      agregarImagen(casoSeleccionado.id, nueva);
      setImagenActiva(publicUrl);
      console.log("¡Éxito! URL en Supabase:", publicUrl);

      // --- 2. CONSULTAR A TU INTELIGENCIA ARTIFICIAL ---
      // Usamos la URL de tu .env.local (o directamente localhost si falla)
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      
      const respuestaIA = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imagen_url: publicUrl })
      });

      if (!respuestaIA.ok) throw new Error("El backend no pudo procesar la imagen");

      const datosIA = await respuestaIA.json();
      console.log("¡Magia de la IA!", datosIA);

      // --- 3. ACTUALIZAR LA PANTALLA CON LOS RESULTADOS ---
      setForm((prev) => ({
        ...prev,
        clasificacion: datosIA.diagnostico,
        // Convertimos el 0.015 a 1.5% para que la barrita lo entienda bien
        probabilidad: (datosIA.probabilidad_maligno * 100).toFixed(2) 
      }));

      setModo("editar");

    } catch (error) {
      console.error("Error en el proceso:", error.message);
      alert("Hubo un error al procesar la imagen. Revisa la consola.");
    }
  };

  const esLectura = modo === "ver";

  // ── Sin caso seleccionado
  if (!casoSeleccionado) {
    return (
      <aside className="col-span-6 bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center gap-3 h-full">
        <div className="text-4xl">🔬</div>
        <p className="text-sm text-gray-400 text-center">
          Selecciona un caso para ver el panel de diagnóstico.
        </p>
      </aside>
    );
  }

  const imagenes = casoSeleccionado.imagenes ?? [];

  return (
    <aside className="col-span-6 bg-white rounded-xl shadow p-4 flex flex-col h-full gap-4 overflow-y-auto">

      {/* ── Encabezado */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-700">Panel de Diagnóstico</h2>
          <p className="text-xs text-gray-400">
            {casoSeleccionado.nombre} {casoSeleccionado.apellido}
          </p>
        </div>
        {esLectura ? (
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

      {/* ── Imagen principal (AHORA CLICKABLE) */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center relative group">
          {imagenActiva ? (
            <>
              <img src={imagenActiva} alt="Lesión" className="w-full h-full object-cover" />
              {/* Botón flotante para ampliar */}
              <button
                onClick={() => setMostrarModal(true)}
                className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-zoom-in"
              >
                <span className="text-3xl">🔍</span>
                <span className="text-sm font-semibold">Click para Ampliar</span>
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-1">🖼️</div>
              <p className="text-xs">Sin imagen</p>
            </div>
          )}
        </div>

        {/* Historial de miniaturas */}
        {imagenes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imagenes.map((img) => (
              <ImagenThumb
                key={img.id}
                imagen={img}
                activa={imagenActiva === img.url}
                onClick={() => setImagenActiva(img.url)}
              />
            ))}
          </div>
        )}

        {/* Botones subir imagen */}
        <div className="flex gap-2">
          {/* Subir desde PC */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 text-xs font-medium py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            📁 Subir desde PC
          </button>
          {/* Conectar con backend */}
          <button
            disabled
            className="flex-1 text-xs font-medium py-2 rounded-lg border border-dashed border-gray-200 text-gray-300 cursor-not-allowed"
            title="Conectar con backend próximamente"
          >
            ☁️ Desde servidor
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSubirImagen}
          />
        </div>
      </div>

      {/* ── Clasificación y probabilidad */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clasificación</span>
          {esLectura ? (
            <ClasificacionBadge clasificacion={form.clasificacion} />
          ) : (
            <select
              name="clasificacion"
              value={form.clasificacion}
              onChange={handleChange}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400"
            >
              <option>Sin clasificar</option>
              <option>Benigno</option>
              <option>Maligno</option>
            </select>
          )}
        </div>

        {esLectura ? (
          <ProbabilidadBar valor={form.probabilidad} clasificacion={form.clasificacion} />
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Probabilidad (0–100)
            </label>
            <input
              type="number"
              name="probabilidad"
              min="0"
              max="100"
              value={form.probabilidad}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        )}
      </div>

      {/* ── Descripción de la lesión */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Descripción de la lesión
        </label>
        <textarea
          name="descripcionLesion"
          value={form.descripcionLesion}
          onChange={handleChange}
          disabled={esLectura}
          rows={3}
          className={`rounded-lg border px-3 py-2 text-sm text-gray-800 outline-none resize-none transition-colors
            ${esLectura
              ? "bg-gray-50 border-gray-200 text-gray-500"
              : "bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            }`}
        />
      </div>

      {/* ── Fecha de diagnóstico */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Fecha de diagnóstico
        </label>
        <input
          type="date"
          name="fechaDiagnostico"
          value={form.fechaDiagnostico}
          onChange={handleChange}
          disabled={esLectura}
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors
            ${esLectura
              ? "bg-gray-50 border-gray-200 text-gray-500"
              : "bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            }`}
        />
      </div>

      {/* ── Confirmar diagnóstico IA */}
      <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer
        ${form.diagnosticoConfirmado
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
        }`}
      >
        <input
          type="checkbox"
          name="diagnosticoConfirmado"
          checked={form.diagnosticoConfirmado}
          onChange={handleChange}
          disabled={esLectura}
          className="w-4 h-4 accent-green-600"
        />
        <div>
          <p className="text-sm font-semibold text-gray-700">Diagnóstico confirmado por el doctor</p>
          <p className="text-xs text-gray-400">Marca esta casilla para validar la sugerencia de la IA</p>
        </div>
      </label>

      {/* ── ── ── ── MODAL PARA IMAGEN AMPLIADA ── ── ── ── */}
      {mostrarModal && imagenActiva && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm"
          onClick={() => setMostrarModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden relative max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Vista Dermatoscópica</h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-gray-500 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Imagen centrada y ajustada */}
            <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center overflow-auto">
              <img 
                src={imagenActiva} 
                alt="Ampliación" 
                className="max-h-[65vh] rounded-lg shadow-md border object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICACIÓN FLOTANTE (TOAST) ── */}
      {notificacion && (
        <div 
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-sm font-semibold text-white flex items-center gap-3 transition-all duration-500 z-50 animate-bounce
            ${notificacion.tipo === 'exito' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {notificacion.tipo === 'exito' ? (
            <span className="text-xl">✅</span>
          ) : (
            <span className="text-xl">⚠️</span>
          )}
          {notificacion.texto}
        </div>
      )}

    </aside>
  );
};

export default DiagnosisPanel;