import React from 'react';
import { RocketIcon } from "../../assets/icons";

const SimulacionCard = ({ 
  id = "000001", 
  fecha = "07/12/2024", 
  monto = 750000, 
  tipoCredito = "Mi Vivienda", 
  categoria = "Casa",
  onDelete,
  onViewDetails 
}) => {

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2, 
    }).format(value);
  };

  return (
    <div className="font-['Poppins'] bg-white rounded-[24px] shadow-[0_5px_30px_-10px_rgba(0,0,0,0.1)] p-5 w-full max-w-[300px] mx-auto border border-gray-100 transition-transform hover:scale-[1.01]">
      
      {/* Header: Categoría y Botón Eliminar con ESTILOS DE PROPIEDADCARD */}
      <div className="flex justify-between items-center mb-4 gap-2">
        
        {/* Etiqueta Categoría (Estilo idéntico a PropiedadCard) */}
        <div className="bg-[#DBEafe] px-4 py-1.5 rounded-full flex items-center justify-center">
          <span className="text-xs sm:text-sm font-semibold text-[#1E40AF]">
            {categoria}
          </span>
        </div>
        
        {/* Botón Eliminar (Misma tipografía y padding, color rojo de alerta) */}
        <button 
          onClick={(e) => {
             e.stopPropagation();
             onDelete();
          }}
          className="bg-[#EF5350] hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200"
        >
          Eliminar
        </button>
      </div>

      {/* Info */}
      <div className="mb-3 space-y-0.5">
        <div className="text-lg font-bold text-slate-700 flex items-center gap-1.5">
          Simulación <span className="text-slate-500">#{id}</span>
        </div>
        <div className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
          Realizada el <span>{fecha}</span>
        </div>
      </div>

      <hr className="border-t-2 border-slate-200 my-4" />

      {/* Detalles Financieros */}
      <div className="mb-8 space-y-1">
        <div className="text-base font-bold text-slate-800 flex items-center flex-wrap">
          Crédito de <span className="text-[#00C853] ml-1.5 text-lg">S/ {formatCurrency(monto)}</span>
        </div>
        <div className="text-base font-bold text-slate-800 flex items-center">
          Crédito <span className="text-blue-600 ml-1.5">{tipoCredito}</span>
        </div>
      </div>

      {/* Botón Ver Detalles */}
      <button 
        onClick={onViewDetails}
        className="w-full bg-[#1A65EB] hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300"
      >
        <RocketIcon width={20} height={20} fill="#FFFFFF" />
        <span>Ver Detalles</span>
      </button>
    </div>
  );
};

export default SimulacionCard;