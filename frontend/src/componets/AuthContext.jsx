import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. Inicializamos Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);
  const [cargandoGlobal, setCargandoGlobal] = useState(true);

  // 2. Escuchar cambios de sesión (si entra o sale)
  useEffect(() => {
    // Revisar sesión actual al recargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user || null);
      setCargandoGlobal(false);
    });

    // Escuchar cuando el usuario hace login o logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Función REAL de Registro
  const registro = async (nombre, email, password) => {
    setError(null);
    try {
      // Registrar en el sistema de autenticación de Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nombre // Guardamos el nombre del doctor
          }
        }
      });

      if (authError) throw authError;

      // Si no te configuré la base de datos para guardar el nombre, 
      // esto al menos asegura que el usuario se creó en la tabla secreta auth.users.
      return true; // Éxito!

    } catch (err) {
      console.error("Error en registro:", err);
      // Traducir algunos errores comunes para que se vean bonitos en tu UI
      if (err.message.includes("User already registered")) {
        setError("Este correo ya está registrado.");
      } else {
        setError("Hubo un problema al crear la cuenta. Intenta nuevamente.");
      }
      return false; // Fallo
    }
  };

  // 4. Función REAL de Login
  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      return true; // Éxito! El useEffect de arriba detectará el cambio y actualizará 'usuario'
    } catch (err) {
      console.error("Error en login:", err);
      setError("Correo o contraseña incorrectos.");
      return false; // Fallo
    }
  };

  // 5. Función para cerrar sesión (Puedes llamarla desde un botón en tu navbar/sidebar)
const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null); 
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoGlobal, // Para que no parpadee la pantalla mientras verifica la sesión
        login,
        registro,
        logout,
        error,
        setError,
      }}
    >
      {!cargandoGlobal && children} 
    </AuthContext.Provider>
  );
};