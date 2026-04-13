import React, { useState, useEffect, useRef } from "react";
import { useCasos } from "./CasosContext";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ProbabilidadBar = ({ valor, clasificacion }) => {
  const color =
    clasificacion === "Maligno"     ? "bg-red-500"
    : clasificacion === "Benigno"   ? "bg-green-500"
    : "bg-gray-300";

  return (
    <div className="flex flex-col gap-2 p-4 border border-gray-100 rounded-xl bg-gray-50 mt-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-bold text-gray-700">Probabilidad del modelo</span>
        <span className={`font-bold text-lg ${clasificacion === "Maligno" ? "text-red-600" : clasificacion === "Benigno" ? "text-green-600" : "text-gray-500"}`}>
          {valor ?? "0"}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${valor ?? 0}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Valor generado automáticamente por el modelo de IA al analizar la imagen.
      </p>
    </div>
  );
};

const ClasificacionBadge = ({ clasificacion }) => {
  const estilos = {
    Maligno:       "bg-red-100 text-red-700 border-red-200",
    Benigno:       "bg-green-100 text-green-700 border-green-200",
    "Sin clasificar": "bg-gray-100 text-gray-500 border-gray-200",
  };
  const iconos = { Maligno: "⚠️", Benigno: "✅", "Sin clasificar": "❓" };

  return (
    <div className="flex flex-col gap-1.5 mt-2 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clasificación</span>
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${estilos[clasificacion] ?? estilos["Sin clasificar"]}`}>
          {iconos[clasificacion]} {clasificacion}
        </span>
      </div>
      <p className="text-xs text-gray-400">Asignada automáticamente por el modelo de IA.</p>
    </div>
  );
};

// ── ACTUALIZADO: Miniatura del historial con botón de borrar
const ImagenThumb = ({ imagen, activa, onClick, onBorrar }) => (
  <div className="relative group flex-shrink-0 mt-2 mr-2">
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all block
        ${activa ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
    >
      <img src={imagen.url} alt={imagen.fecha} className="w-full h-full object-cover" />
    </button>
    
    {/* Botón flotante 'X' (solo se muestra si la imagen no es la que se está viendo y se pasa el mouse encima) */}
    {!activa && (
      <button
        onClick={(e) => {
          e.stopPropagation(); // Evita que la imagen se seleccione al darle a borrar
          onBorrar(imagen);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
        title="Eliminar del historial"
      >
        ✕
      </button>
    )}
  </div>
);

// ────────────────────────────────────────────
const DiagnosisPanel = () => {
  const { casoSeleccionado, guardarCaso, borrarImagen } = useCasos(); // <-- Traemos borrarImagen

  const [modo, setModo]           = useState("ver");
  const [form, setForm]           = useState({});
  const [imagenActiva, setImagenActiva] = useState(null);
  const fileInputRef              = useRef(null);
  const [notificacion, setNotificacion] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Nuevo estado para controlar el modal de confirmación de borrado de imagen
  const [imagenABorrar, setImagenABorrar] = useState(null);

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
      if (!casoSeleccionado || !casoSeleccionado.id) {
        setNotificacion({ tipo: "error", texto: "No hay un paciente activo." });
        setTimeout(() => setNotificacion(null), 4000);
        return;
      }

      const nuevoDiagnostico = {
        paciente_id: casoSeleccionado.id, 
        imagen_url: imagenActiva,
        clasificacion: form.clasificacion,
        probabilidad: parseFloat(form.probabilidad) || 0,
        descripcion_medico: form.descripcionLesion || "Sin observaciones",
        diagnostico_confirmado: form.diagnosticoConfirmado || false,
        fecha_diagnostico: form.fechaDiagnostico || new Date().toISOString().slice(0, 10)
      };

      const { error: errorDiag } = await supabase
        .from("Diagnostico")
        .insert(nuevoDiagnostico);

      if (errorDiag) throw errorDiag;

      const { error: errorPac } = await supabase
        .from("Pacientes")
        .update({ estado: "Diagnósticado" })
        .eq("id", casoSeleccionado.id);

      if (errorPac) console.warn("No se pudo actualizar el estado del paciente.");

      await guardarCaso(casoSeleccionado);

      setModo("ver");
      setNotificacion({ tipo: "exito", texto: "¡Diagnóstico guardado exitosamente!" });
      setTimeout(() => setNotificacion(null), 4000);

    } catch (error) {
      console.error("Error al guardar:", error);
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

  const handleSubirImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setNotificacion({ tipo: "info", texto: "Subiendo y analizando imagen..." });

      const fileExt = file.name.split('.').pop();
      const fileName = `${casoSeleccionado.id}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('imagenes_lunares')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes_lunares')
        .getPublicUrl(fileName);

      setImagenActiva(publicUrl);

      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      
      const respuestaIA = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagen_url: publicUrl })
      });

      if (!respuestaIA.ok) throw new Error("Fallo en la IA");

      const datosIA = await respuestaIA.json();

      setForm((prev) => ({
        ...prev,
        clasificacion: datosIA.diagnostico,
        probabilidad: (datosIA.probabilidad_maligno * 100).toFixed(2) 
      }));

      setNotificacion(null);
      setModo("editar");

    } catch (error) {
      console.error("Error:", error.message);
      setNotificacion({ tipo: "error", texto: "Error al procesar la imagen." });
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  // --- NUEVO: FUNCIÓN PARA CONFIRMAR EL BORRADO DE IMAGEN ---
  const confirmarBorradoImagen = async () => {
    if (!imagenABorrar) return;
    try {
      await borrarImagen(imagenABorrar.id, casoSeleccionado.id);
      setNotificacion({ tipo: "exito", texto: "Imagen eliminada del historial." });
      setImagenABorrar(null); // Cierra el modal
      setTimeout(() => setNotificacion(null), 3000);
    } catch (error) {
      setNotificacion({ tipo: "error", texto: "No se pudo eliminar la imagen." });
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  const esLectura = modo === "ver";

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
    <aside className="col-span-6 bg-white rounded-xl shadow p-4 flex flex-col h-full gap-4 overflow-y-auto relative">

      {/* ── Encabezado */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-700">Panel de Diagnóstico</h2>
          <p className="text-xs text-gray-400 mt-0.5">
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

      {/* ── Imagen principal */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center relative group">
          {imagenActiva ? (
            <>
              <img src={imagenActiva} alt="Lesión" className="w-full h-full object-cover" />
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
          <div className="flex gap-2 overflow-x-auto pb-1 pl-1 pt-1">
            {imagenes.map((img) => (
              <ImagenThumb
                key={img.id}
                imagen={img}
                activa={imagenActiva === img.url}
                onClick={() => setImagenActiva(img.url)}
                onBorrar={(img) => setImagenABorrar(img)} // Abre el modal
              />
            ))}
          </div>
        )}

        {/* Botones subir imagen */}
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 text-xs font-medium py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            📁 Subir desde PC
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

      {/* ── SECCIÓN DE RESULTADOS IA */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Análisis de Inteligencia Artificial</h3>
        <ClasificacionBadge clasificacion={form.clasificacion} />
        <ProbabilidadBar valor={form.probabilidad} clasificacion={form.clasificacion} />
      </div>

      {/* ── Descripción y Fecha */}
      <div className="grid grid-cols-1 gap-3 mt-2">
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
      </div>

      <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer mt-1
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
          className="w-4 h-4 accent-green-600 rounded"
        />
        <div>
          <p className="text-sm font-semibold text-gray-700">Diagnóstico confirmado por el doctor</p>
          <p className="text-xs text-gray-400">Marca esta casilla para validar la sugerencia de la IA.</p>
        </div>
      </label>

      {/* ── MODAL DE ZOOM DE IMAGEN ── */}
      {mostrarModal && imagenActiva && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm"
          onClick={() => setMostrarModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden relative max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Vista Dermatoscópica</h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-gray-500 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
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

      {/* ── MODAL DE CONFIRMACIÓN DE BORRADO ── */}
      {imagenABorrar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar imagen?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción eliminará la imagen y su diagnóstico asociado del historial clínico de forma permanente.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setImagenABorrar(null)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBorradoImagen}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICACIÓN (TOAST) ── */}
      {notificacion && (
        <div 
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-sm font-semibold text-white flex items-center gap-3 transition-all duration-500 z-[70] animate-bounce
            ${notificacion.tipo === 'exito' ? 'bg-green-600' 
            : notificacion.tipo === 'info' ? 'bg-blue-600'
            : 'bg-red-600'}`}
        >
          {notificacion.tipo === 'exito' ? <span className="text-xl">✅</span>
          : notificacion.tipo === 'info' ? <span className="text-xl inline-block animate-spin">⏳</span>
          : <span className="text-xl">⚠️</span>}
          {notificacion.texto}
        </div>
      )}

    </aside>
  );
};

export default DiagnosisPanel;