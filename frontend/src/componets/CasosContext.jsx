import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "./AuthContext"; // <--- 1. IMPORTANTE: Importamos el AuthContext

// Inicializamos Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CasosContext = createContext();

export const useCasos = () => useContext(CasosContext);

export const CasosProvider = ({ children }) => {
  const [casos, setCasos] = useState([]); // Iniciamos con un arreglo VACÍO
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  
  // 2. Traemos la información de quién está logueado
  const { usuario } = useAuth(); 

  // --- FUNCIÓN: CARGAR Y TRADUCIR DATOS REALES ---
  const cargarPacientes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCasos([]); 
        return;
      }

      // 1. Traer los pacientes y sus diagnósticos anidados
      const { data, error } = await supabase
        .from("Pacientes")
        .select(`
          *,
          Diagnostico (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // 2. Traductor
      const pacientesTraduccion = data.map((paciente) => {
        const diag = paciente.Diagnostico && paciente.Diagnostico.length > 0 
          ? paciente.Diagnostico[0] 
          : null;

        return {
          id: paciente.id,
          nombre: paciente.nombre || "",
          apellido: paciente.apellido || "",
          fechaNacimiento: paciente.fecha_nacimiento || "", 
          estado: paciente.estado || "Activo",
          notas: paciente.observaciones || paciente.notas || "", 

          imagenPrincipal: diag ? diag.imagen_url : null,
          clasificacion: diag ? diag.clasificacion : "Sin clasificar",
          probabilidad: diag ? diag.probabilidad : "", 
          descripcionLesion: diag ? diag.descripcion_medico : "",
          fechaDiagnostico: diag ? diag.fecha_diagnostico : "",
          diagnosticoConfirmado: diag ? diag.diagnostico_confirmado : false,
        };
      });

      // 3. Entregar los datos ya limpios a la interfaz
      setCasos(pacientesTraduccion);

    } catch (error) {
      console.error("Error cargando historial:", error.message);
    }
  };

  // --- 3. EL NUEVO USEEFFECT INTELIGENTE ---
  useEffect(() => {
    if (usuario) {
      // Si el doctor inicia sesión, carga SUS pacientes
      cargarPacientes();
    } else {
      // Si el doctor cierra sesión, borramos todo de la pantalla por seguridad
      setCasos([]);
      setCasoSeleccionado(null);
    }
  }, [usuario]); // <--- React ahora vigila los cambios en 'usuario'

  // Función para cuando se crea un paciente nuevo
  const guardarCaso = async (nuevoPacienteBd) => {
    // Al crear uno nuevo, es más seguro volver a pedir la lista completa 
    // a Supabase para que pase por el "traductor" y tenga el formato correcto.
    await cargarPacientes();
  };

  const borrarCaso = async (id) => {
    try {
      // 1. Le decimos a Supabase que elimine la fila de este paciente
      const { error } = await supabase
        .from('Pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 2. Si Supabase lo borró con éxito, lo quitamos de la pantalla
      setCasos((prev) => prev.filter((c) => c.id !== id));
      setCasoSeleccionado(null);
      
      console.log("Paciente eliminado definitivamente de la base de datos.");

    } catch (error) {
      console.error("Error al borrar el paciente:", error.message);
      alert("Hubo un error al intentar borrar el paciente.");
    }
  };

  // Función temporal
  const guardarDiagnostico = (id, datos) => {
    console.log("Guardando diagnóstico para", id, datos);
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
        guardarDiagnostico,
        agregarImagen,
      }}
    >
      {children}
    </CasosContext.Provider>
  );
};