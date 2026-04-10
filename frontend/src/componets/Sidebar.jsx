import React from "react";
import { useCasos } from "./CasosContext";

const EstadoBadge = ({ estado }) => {
  const colores = {
    Activo:      "bg-green-100 text-green-700",
    Seguimiento: "bg-yellow-100 text-yellow-700",
    Cerrado:     "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colores[estado] ?? "bg-blue-100 text-blue-700"}`}>
      {estado}
    </span>
  );
};

const CasoCard = ({ caso, seleccionado, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
      ${seleccionado
        ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300"
        : "border-gray-100 hover:bg-blue-50 hover:border-blue-200"
      }`}
  >
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-gray-800">
        {caso.nombre} {caso.apellido}
      </span>
      <span className="text-xs text-gray-400">{caso.diagnostico}</span>
    </div>
    <div className="flex flex-col items-end gap-1">
      <EstadoBadge estado={caso.estado} />
      <span className="text-xs text-gray-400">{caso.fechaNacimiento}</span>
    </div>
  </button>
);

const Sidebar = () => {
  const { casos, casoSeleccionado, setCasoSeleccionado } = useCasos();

  // Primeros 15 — el resto lo maneja el backend con LIMIT 15
  const casosVisibles = casos.slice(0, 15);

  const handleClick = (caso) => {
    // Si haces click en el ya seleccionado, lo deselecciona
    setCasoSeleccionado(casoSeleccionado?.id === caso.id ? null : caso);
  };

  return (
    <aside className="col-span-3 bg-white rounded-xl shadow p-4 flex flex-col h-full">
      
      {/* ── Encabezado Actualizado con Botón Nuevo ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-700">Historial de Casos</h2>
          <p className="text-xs text-gray-400">{casosVisibles.length} casos recientes</p>
        </div>
        
        <button
          onClick={() => setCasoSeleccionado(null)}
          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-sm cursor-pointer"
        >
          ➕ Nuevo
        </button>
      </div>

      {/* Lista con scroll */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-1">
        {casosVisibles.map((caso) => (
          <CasoCard
            key={caso.id}
            caso={caso}
            seleccionado={casoSeleccionado?.id === caso.id}
            onClick={() => handleClick(caso)}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;