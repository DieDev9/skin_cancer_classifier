import React, { useState, useEffect, useRef } from "react";
import { useCasos } from "./CasosContext";

// ── Barra de probabilidad
const ProbabilidadBar = ({ valor, clasificacion }) => {
  const color =
    clasificacion === "Maligno"       ? "bg-red-500"
    : clasificacion === "Benigno"     ? "bg-green-500"
    : "bg-yellow-400";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span className="uppercase tracking-wide">Probabilidad de malignidad</span>
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
  const [cargandoIA, setCargandoIA] = useState(false);
  const fileInputRef              = useRef(null);

  // Sincronizar cuando cambia el caso
  useEffect(() => {
    if (casoSeleccionado) {
      setForm({
        descripcionLesion:    casoSeleccionado.descripcionLesion    ?? "",
        clasificacion:        casoSeleccionado.clasificacion         ?? "Sin clasificar",
        probabilidad:         casoSeleccionado.probabilidad          ?? "",
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

  const handleGuardar = () => {
    guardarDiagnostico(casoSeleccionado.id, {
      ...form,
      probabilidad: form.probabilidad === "" ? null : Number(form.probabilidad),
    });
    setModo("ver");
  };

  const handleCancelar = () => {
    setForm({
      descripcionLesion:     casoSeleccionado.descripcionLesion    ?? "",
      clasificacion:         casoSeleccionado.clasificacion         ?? "Sin clasificar",
      probabilidad:          casoSeleccionado.probabilidad          ?? "",
      fechaDiagnostico:      casoSeleccionado.fechaDiagnostico      ?? "",
      diagnosticoConfirmado: casoSeleccionado.diagnosticoConfirmado ?? false,
    });
    setModo("ver");
  };

  
// Subir imagen desde PC y consultar a la IA
  const handleArchivoLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Mostrar la imagen en pantalla inmediatamente
    const url = URL.createObjectURL(file);
    const nueva = { id: Date.now(), url, fecha: new Date().toISOString().slice(0, 10), esLocal: true };
    agregarImagen(casoSeleccionado.id, nueva);
    setImagenActiva(url);

    // 2. Preparar el paquete de datos para FastAPI
    const formData = new FormData();
    formData.append("file", file); // "file" es el nombre exacto que espera tu backend

    setCargandoIA(true);
    try {
      // 3. Hacer la petición al puerto 8000 donde corre uvicorn
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error en el servidor de IA");
      }

      // 4. Recibir el diagnóstico (Benigno/Maligno) y la probabilidad
      const data = await response.json();

      // 5. Actualizar los campos del formulario automáticamente con el resultado
      setForm((prev) => ({
        ...prev,
        clasificacion: data.diagnostico,
        // Convertimos el decimal (0.0000002) a porcentaje (0.00%)
        probabilidad: (data.probabilidad_maligno * 100).toFixed(2), 
        fechaDiagnostico: new Date().toISOString().slice(0, 10),
      }));

      // Pasamos a modo edición para que el doctor pueda revisar y confirmar
      setModo("editar"); 

    } catch (error) {
      console.error("Error al consultar la IA:", error);
      alert("Error al conectar con la IA. Asegúrate de que el backend (FastAPI) esté corriendo.");
    } finally {
      setCargandoIA(false);
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

      {/* ── Imagen principal */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {imagenActiva ? (
            <img src={imagenActiva} alt="Lesión" className="w-full h-full object-cover" />
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
            onChange={handleArchivoLocal}
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
              PROBABILIDAD DE MALIGNIDAD (0-100)
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

    </aside>
  );
};

export default DiagnosisPanel;
