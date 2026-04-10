import React, { useState, useEffect } from "react";
import { useCasos } from "./CasosContext";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CAMPOS_VACIOS = {
  nombre:          "",
  apellido:        "",
  fechaNacimiento: "",
  //diagnostico:     "",
  estado:          "Activo",
  notas:           "",
};

const InputField = ({ label, name, type = "text", value, onChange, disabled }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-sm text-gray-800 outline-none transition-colors
        ${disabled
          ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
          : "bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        }`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, disabled, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-sm text-gray-800 outline-none transition-colors
        ${disabled
          ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
          : "bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        }`}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const TextAreaField = ({ label, name, value, onChange, disabled }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={4}
      className={`rounded-lg border px-3 py-2 text-sm text-gray-800 outline-none transition-colors resize-none
        ${disabled
          ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
          : "bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        }`}
    />
  </div>
);

// ────────────────────────────────────────────
const UploadForm = () => {
  const { casoSeleccionado, setCasoSeleccionado, guardarCaso, borrarCaso } = useCasos();

  // Modos: "ver" | "editar" | "crear"
  const [modo, setModo]         = useState("ver");
  const [formData, setFormData] = useState(CAMPOS_VACIOS);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sincroniza el form cuando cambia el caso seleccionado
  useEffect(() => {
    if (casoSeleccionado) {
      setFormData({ ...casoSeleccionado });
      setModo("ver");
    } else {
      setFormData(CAMPOS_VACIOS);
      setModo("ver");
    }
    setConfirmDelete(false);
  }, [casoSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleGuardar = async () => {
    // Validación básica
    if (!formData.nombre.trim() || !formData.apellido.trim()) return;

    try {
      // 1. Preguntar a Supabase quién es el doctor logueado en este momento
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      // Si no hay usuario o la sesión expiró, detenemos todo
      if (authError || !user) {
        alert("Tu sesión ha expirado o no has iniciado sesión.");
        return;
      }

      // 2. Empaquetar los datos del paciente INCLUYENDO el user_id
      const nuevoPaciente = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        fecha_nacimiento: formData.fechaNacimiento || null,
        estado: formData.estado || "Activo",
        user_id: user.id  // <-- ESTA ES LA LLAVE MÁGICA
      };

      // 3. Enviar a Supabase (asumiendo que así lo tenías)
      const { data, error } = await supabase
        .from("Pacientes")
        .insert(nuevoPaciente)
        .select();

      if (error) throw error;

      // 4. Actualizar la interfaz
      guardarCaso(data[0]); // O como llames a tu función para actualizar el estado
      setModo("ver");
      

    } catch (error) {
      console.error("Error al guardar paciente:", error.message);
      alert("Hubo un error al guardar. Revisa la consola.");
    }
  };

  const handleCancelar = () => {
    if (casoSeleccionado) {
      setFormData({ ...casoSeleccionado });
      setModo("ver");
    } else {
      setFormData(CAMPOS_VACIOS);
      setCasoSeleccionado(null);
    }
    setConfirmDelete(false);
  };

  const handleBorrar = () => {
    if (confirmDelete) {
      borrarCaso(casoSeleccionado.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  const modoCrear = !casoSeleccionado && modo !== "crear";
  const esLectura = modo === "ver" && !!casoSeleccionado;
  const esEdicion = modo === "editar" || modo === "crear";

  // ── Estado vacío (sin caso seleccionado y sin modo crear)
  if (!casoSeleccionado && modo !== "crear") {
    return (
      <main className="col-span-3 bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-4 h-full">
        <div className="text-center">
          <div className="text-5xl mb-3">🩺</div>
          <h2 className="text-lg font-bold text-gray-700">Ningún caso seleccionado</h2>
          <p className="text-sm text-gray-400 mt-1">
            Selecciona un caso del historial o crea uno nuevo.
          </p>
        </div>
        <button
          onClick={() => { setFormData(CAMPOS_VACIOS); setModo("crear"); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow"
        >
          <span className="text-lg leading-none">+</span> Crear nuevo caso
        </button>
      </main>
    );
  }

  return (
    <main className="col-span-3 bg-white rounded-xl shadow p-6 flex flex-col h-full gap-5">

      {/* ── Encabezado */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-700">
            {modo === "crear"
              ? "Nuevo caso"
              : `${casoSeleccionado?.nombre} ${casoSeleccionado?.apellido}`}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {modo === "crear" ? "Completa los datos del nuevo paciente" :
             modo === "editar" ? "Editando información del paciente" :
             "Información del paciente"}
          </p>
        </div>

        {/* Botones de acción en modo VER */}
        {esLectura && (
          <div className="flex gap-2">
            <button
              onClick={() => setModo("editar")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              ✏️ Editar
            </button>
            <button
              onClick={handleBorrar}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-colors
                ${confirmDelete
                  ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                  : "border-red-200 text-red-500 hover:bg-red-50"
                }`}
            >
              🗑️ {confirmDelete ? "¿Confirmar borrado?" : "Borrar"}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Campos del formulario */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
        <InputField
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={esLectura}
        />
        <InputField
          label="Apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          disabled={esLectura}
        />
        <InputField
          label="Fecha de nacimiento"
          name="fechaNacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          disabled={esLectura}
        />
        <SelectField
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          disabled={esLectura}
          options={["Activo", "Seguimiento", "Cerrado"]}
        />
        {/*<div className="col-span-2">
          <InputField
            label="Diagnóstico"
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleChange}
            disabled={esLectura}
          />
        </div>*/}
        <div className="col-span-2">
          <TextAreaField
            label="Notas / Observaciones"
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            disabled={esLectura}
          />
        </div>
      </div>

      {/* ── Botones guardar / cancelar (solo en modo edición o creación) */}
      {/* ── Botones guardar / cancelar (solo en modo edición o creación) */}
      {esEdicion && (
        <div className="flex gap-3 justify-end border-t pt-4">
          <button
            onClick={handleCancelar}
            className="text-sm font-medium px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          {/* BOTÓN DINÁMICO */}
          <button
            onClick={handleGuardar}
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow"
          >
            {modo === "crear" ? "➕ Crear Paciente" : "💾 Guardar Cambios"}
          </button>
        </div>
      )}
    </main>
  );
};

export default UploadForm;
