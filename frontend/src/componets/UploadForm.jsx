import React, { useState, useEffect } from "react";
import { useCasos } from "./CasosContext";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CAMPOS_VACIOS = {
  nombre: "",
  apellido: "",
  colorPiel: "",
  fechaNacimiento: "",
  notas: "",
};

// Componentes de la interfaz
const InputField = ({ label, name, type = "text", value, onChange, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors
        ${disabled
          ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
          : "bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={4}
      className={`rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors resize-none
        ${disabled
          ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
          : "bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
    />
  </div>
);

// Función matemática para calcular la edad
const calcularEdad = (fecha) => {
  if (!fecha) return "";
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

// ────────────────────────────────────────────
const UploadForm = () => {
  const { casoSeleccionado, setCasoSeleccionado, guardarCaso, borrarCaso } = useCasos();

  const [modo, setModo]         = useState("ver");
  const [formData, setFormData] = useState(CAMPOS_VACIOS);
  const [confirmDelete, setConfirmDelete] = useState(false);

useEffect(() => {
    if (casoSeleccionado) {
      setFormData({
        nombre: casoSeleccionado.nombre || "",
        apellido: casoSeleccionado.apellido || "",
        colorPiel: casoSeleccionado.colorPiel || casoSeleccionado.color_piel || "",
        fechaNacimiento: casoSeleccionado.fechaNacimiento || casoSeleccionado.fecha_nacimiento || "",
        notas: casoSeleccionado.notas || ""
      });
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
    if (!formData.nombre.trim() || !formData.apellido.trim()) return;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Tu sesión ha expirado o no has iniciado sesión.");
        return;
      }

      const datosPaciente = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        color_piel: formData.colorPiel,
        fecha_nacimiento: formData.fechaNacimiento || null,
        observaciones: formData.observaciones || "",
        user_id: user.id  
      };

      if (modo === "editar" && casoSeleccionado) {
        const { error } = await supabase
          .from("Pacientes")
          .update(datosPaciente)
          .eq("id", casoSeleccionado.id); 

        if (error) throw error;
        guardarCaso({ ...casoSeleccionado, ...datosPaciente }); 

      } else {
        // AUTOMATIZACIÓN: Si es nuevo, forzamos que sea "Sin diagnóstico"
        const datosNuevo = { ...datosPaciente, estado: "Sin diagnóstico" };
        const { data, error } = await supabase
          .from("Pacientes")
          .insert(datosNuevo)
          .select();

        if (error) throw error;
        guardarCaso(data[0]); 
      }

      setModo("ver");

    } catch (error) {
      console.error("Error al guardar paciente:", error.message);
      alert("Hubo un error al guardar. Revisa la consola.");
    }
  };

  const handleCancelar = () => {
    if (casoSeleccionado) {
      setFormData({
        nombre: casoSeleccionado.nombre || "",
        apellido: casoSeleccionado.apellido || "",
        colorPiel: casoSeleccionado.color_piel || "",
        fechaNacimiento: casoSeleccionado.fecha_nacimiento || "",
        observaciones: casoSeleccionado.observaciones || ""
      });
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

  const esLectura = modo === "ver" && !!casoSeleccionado;
  const esEdicion = modo === "editar" || modo === "crear";

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
          <span className="text-lg leading-none">+</span> Crear nuevo paciente
        </button>
      </main>
    );
  }

  return (
    <main className="col-span-3 bg-white rounded-xl shadow p-6 flex flex-col h-full gap-5">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {modo === "crear"
              ? "Nuevo paciente"
              : `${formData.nombre} ${formData.apellido}`}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {modo === "crear" ? "Completa los datos del nuevo paciente" : "Información del paciente"}
          </p>
        </div>

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

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2 pb-4">
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
          label="Color de piel"
          name="colorPiel"
          value={formData.colorPiel}
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
        
        {/* Campo de edad auto-calculado */}
        <InputField
          label="Edad"
          name="edad"
          value={calcularEdad(formData.fechaNacimiento)}
          disabled={true} 
          onChange={() => {}} 
        />

        <TextAreaField
          label="Notas / Observaciones"
          name="notas"
          value={formData.observaciones}
          onChange={handleChange}
          disabled={esLectura}
        />
      </div>

      {esEdicion && (
        <div className="flex gap-3 justify-end border-t pt-4">
          <button
            onClick={handleCancelar}
            className="text-sm font-medium px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow"
          >
            {modo === "crear" ? "➕ Crear Paciente" : "💾 Guardar Cambios"}
          </button>
        </div>
      )}
    </main>
  );
};

export default UploadForm;