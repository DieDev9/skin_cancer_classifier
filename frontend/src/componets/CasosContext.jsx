import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "./AuthContext"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CasosContext = createContext();

export const useCasos = () => useContext(CasosContext);

export const CasosProvider = ({ children }) => {
  const [casos, setCasos] = useState([]); 
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  
  const { usuario } = useAuth(); 

  const cargarPacientes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCasos([]); 
        return [];
      }

      const { data, error } = await supabase
        .from("Pacientes")
        .select(`
          *,
          Diagnostico (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const pacientesTraduccion = data.map((paciente) => {
        const diagnosticosSorted = paciente.Diagnostico?.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        ) || [];

        const ultimoDiag = diagnosticosSorted[0] || null;

        return {
          id: paciente.id,
          nombre: paciente.nombre || "",
          apellido: paciente.apellido || "",
          colorPiel: paciente.color_piel || "", 
          fechaNacimiento: paciente.fecha_nacimiento || "", 
          estado: paciente.estado || "Sin diagnóstico",
          notas: paciente.notas || "", 

          imagenes: diagnosticosSorted.map(d => ({
            id: d.id,
            url: d.imagen_url,
            fecha: d.fecha_diagnostico
          })),

          imagenPrincipal: ultimoDiag ? ultimoDiag.imagen_url : null,
          clasificacion: ultimoDiag ? ultimoDiag.clasificacion : "Sin clasificar",
          probabilidad: ultimoDiag ? ultimoDiag.probabilidad : "", 
          descripcionLesion: ultimoDiag ? ultimoDiag.descripcion_medico : "",
          fechaDiagnostico: ultimoDiag ? ultimoDiag.fecha_diagnostico : "",
          diagnosticoConfirmado: ultimoDiag ? ultimoDiag.diagnostico_confirmado : false,
        };
      });

      setCasos(pacientesTraduccion);
      return pacientesTraduccion; 

    } catch (error) {
      console.error("Error cargando historial:", error.message);
      return [];
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarPacientes();
    } else {
      setCasos([]);
      setCasoSeleccionado(null);
    }
  }, [usuario]); 

  const guardarCaso = async (pacienteCrudo) => {
    const listaActualizada = await cargarPacientes();
    if (pacienteCrudo && pacienteCrudo.id) {
      const pacienteListo = listaActualizada.find(p => p.id === pacienteCrudo.id);
      if (pacienteListo) {
        setCasoSeleccionado(pacienteListo);
      }
    }
  };

  const borrarCaso = async (id) => {
    try {
      const { error } = await supabase
        .from('Pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCasos((prev) => prev.filter((c) => c.id !== id));
      setCasoSeleccionado(null);
    } catch (error) {
      console.error("Error al borrar paciente:", error.message);
      alert("Hubo un error al intentar borrar el paciente.");
    }
  };

  // --- NUEVA FUNCIÓN: BORRAR IMAGEN DEL HISTORIAL ---
  const borrarImagen = async (imagenId, pacienteId) => {
    try {
      // Borramos el registro específico de la tabla de diagnósticos
      const { error } = await supabase
        .from('Diagnostico')
        .delete()
        .eq('id', imagenId);

      if (error) throw error;

      // Refrescamos el paciente para que la UI se actualice
      await guardarCaso({ id: pacienteId });
      
    } catch (error) {
      console.error("Error al borrar la imagen:", error.message);
      throw error; // Lanzamos el error para que el panel lo atrape y muestre la alerta
    }
  };

  const agregarImagen = (id, imagen) => {
    console.log("Imagen agregada", id, imagen);
  };

  return (
    <CasosContext.Provider
      value={{
        casos,
        casoSeleccionado,
        setCasoSeleccionado,
        guardarCaso,
        borrarCaso,
        borrarImagen, // ¡No olvides exportarla aquí!
        agregarImagen,
      }}
    >
      {children}
    </CasosContext.Provider>
  );
};