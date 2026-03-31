import React, { createContext, useContext, useState } from "react";

const CasosContext = createContext(null);

// Un solo array con TODOS los datos: personales + diagnóstico
export const mockCasos = [
  {
    // ── Datos personales (editables desde UploadForm)
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    fechaNacimiento: "1985-04-12",
    diagnostico: "Hipertensión",
    estado: "Activo",
    notas: "Paciente con presión alta controlada.",

    // ── Datos de diagnóstico de piel (editables desde DiagnosisPanel)
    descripcionLesion: "Lesión pigmentada de bordes irregulares en antebrazo izquierdo.",
    clasificacion: "Maligno",
    probabilidad: 87,
    fechaDiagnostico: "2025-02-10",
    imagenes: [],
    imagenPrincipal: null,
    diagnosticoConfirmado: false,
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Gómez",
    fechaNacimiento: "1990-07-23",
    diagnostico: "Diabetes tipo 2",
    estado: "Seguimiento",
    notas: "Requiere control mensual de glucosa.",

    descripcionLesion: "Mancha eritematosa plana en región dorsal.",
    clasificacion: "Benigno",
    probabilidad: 22,
    fechaDiagnostico: "2025-03-01",
    imagenes: [],
    imagenPrincipal: null,
    diagnosticoConfirmado: true,
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Ruiz",
    fechaNacimiento: "1978-11-05",
    diagnostico: "Asma",
    estado: "Cerrado",
    notas: "Alta médica completada.",

    descripcionLesion: "",
    clasificacion: "Sin clasificar",
    probabilidad: null,
    fechaDiagnostico: "",
    imagenes: [],
    imagenPrincipal: null,
    diagnosticoConfirmado: false,
  },
  {
    id: 4,
    nombre: "Laura",
    apellido: "Martínez",
    fechaNacimiento: "2001-02-18",
    diagnostico: "Ansiedad",
    estado: "Activo",
    notas: "Terapia en curso.",

    descripcionLesion: "Pápula rosada de 3mm en cuello.",
    clasificacion: "Benigno",
    probabilidad: 11,
    fechaDiagnostico: "2025-01-20",
    imagenes: [],
    imagenPrincipal: null,
    diagnosticoConfirmado: false,
  },
  {
    id: 5,
    nombre: "Pedro",
    apellido: "Sánchez",
    fechaNacimiento: "1969-09-30",
    diagnostico: "Artritis",
    estado: "Seguimiento",
    notas: "Medicación ajustada recientemente.",

    descripcionLesion: "Nódulo subcutáneo de bordes definidos en espalda.",
    clasificacion: "Sin clasificar",
    probabilidad: 54,
    fechaDiagnostico: "2025-03-15",
    imagenes: [],
    imagenPrincipal: null,
    diagnosticoConfirmado: false,
  },
];

export const CasosProvider = ({ children }) => {
  const [casos, setCasos]                       = useState(mockCasos);
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);

  // ── Guardar datos personales (desde UploadForm)
  const guardarCaso = (datosCaso) => {
    if (datosCaso.id) {
      setCasos((prev) =>
        prev.map((c) => (c.id === datosCaso.id ? { ...c, ...datosCaso } : c))
      );
      setCasoSeleccionado((prev) => ({ ...prev, ...datosCaso }));
    } else {
      const nuevo = {
        ...datosCaso,
        id: Date.now(),
        descripcionLesion: "",
        clasificacion: "Sin clasificar",
        probabilidad: null,
        fechaDiagnostico: "",
        imagenes: [],
        imagenPrincipal: null,
        diagnosticoConfirmado: false,
      };
      setCasos((prev) => [nuevo, ...prev]);
      setCasoSeleccionado(nuevo);
    }
  };

  // ── Guardar datos de diagnóstico (desde DiagnosisPanel)
  const guardarDiagnostico = (idCaso, datosDiagnostico) => {
    setCasos((prev) =>
      prev.map((c) => (c.id === idCaso ? { ...c, ...datosDiagnostico } : c))
    );
    setCasoSeleccionado((prev) => ({ ...prev, ...datosDiagnostico }));
  };

  // ── Agregar imagen al historial
  const agregarImagen = (idCaso, nuevaImagen) => {
    setCasos((prev) =>
      prev.map((c) =>
        c.id === idCaso
          ? { ...c, imagenes: [nuevaImagen, ...c.imagenes], imagenPrincipal: nuevaImagen.url }
          : c
      )
    );
    setCasoSeleccionado((prev) => ({
      ...prev,
      imagenes: [nuevaImagen, ...prev.imagenes],
      imagenPrincipal: nuevaImagen.url,
    }));
  };

  // ── Borrar caso
  const borrarCaso = (id) => {
    setCasos((prev) => prev.filter((c) => c.id !== id));
    setCasoSeleccionado(null);
  };

  return (
    <CasosContext.Provider
      value={{ casos, casoSeleccionado, setCasoSeleccionado, guardarCaso, guardarDiagnostico, agregarImagen, borrarCaso }}
    >
      {children}
    </CasosContext.Provider>
  );
};

export const useCasos = () => useContext(CasosContext);
