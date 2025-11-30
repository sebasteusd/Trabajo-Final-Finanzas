import React from "react";
// 1. Importamos el hook para navegar
import { useNavigate } from "react-router-dom";

import { 
  ChartIcon, 
  HomeIcon, 
  CreditIcon, 
  AspaIcon, 
  RocketIcon 
} from "../assets/icons";

// Iconos SVGs simples inline (se mantienen igual que en tu código original):
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const PercentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>;

export default function SimulacionDetailsModal({ isOpen, onClose, simulation }) {
  // 2. Inicializamos el hook
  const navigate = useNavigate();

  if (!isOpen || !simulation) return null;

  const formatCurrency = (amount) => {
    const currency = simulation.moneda || "PEN";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 3. Función para manejar la redirección
  const handleRecalculate = () => {
    // Primero cerramos el modal
    onClose();
    
    // Navegamos a la ruta del simulador pasando los datos en el state
    // IMPORTANTE: Asegúrate de que la ruta "/simulador" coincida con tu Router
    navigate("/simulador", { 
      state: { 
        datosPrevios: simulation 
      } 
    });
  };

  const formatPlazo = () => {
      // Si tenemos totalPagos, asumimos que son los meses totales (frecuencia mensual)
      const mesesTotales = simulation.totalPagos; 
      
      if (!mesesTotales) return `${simulation.plazoAnios} Años`;

      const anios = Math.floor(mesesTotales / 12);
      const mesesRestantes = mesesTotales % 12;

      let texto = "";
      
      if (anios > 0) {
          texto += `${anios} Año${anios !== 1 ? 's' : ''}`;
      }
      
      if (mesesRestantes > 0) {
          if (anios > 0) texto += " y ";
          texto += `${mesesRestantes} Mes${mesesRestantes !== 1 ? 'es' : ''}`;
      }

      // Si es menos de 1 mes (raro), mostrar días o 0
      if (texto === "") return "Menos de 1 mes";

      return texto;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Poppins']">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="bg-[#1e293b] p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500 text-xs font-bold px-2 py-0.5 rounded text-white">
                SIM-{simulation.id}
              </span>
              <span className="text-gray-400 text-xs">{simulation.fecha}</span>
            </div>
            <h3 className="text-2xl font-bold">{simulation.tipoCredito}</h3>
            <p className="text-gray-400 text-sm">Resumen de proyección financiera</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* 1. SECCIÓN PRINCIPAL: CUOTA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Cuota Mensual Estimada</p>
              <div className="text-5xl font-extrabold text-[#1e293b] tracking-tight mb-2">
                {formatCurrency(simulation.cuotaMensual)}
              </div>
              <div className="inline-flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full border border-blue-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-blue-800">
                  Tasa Efectiva: {simulation.tasaInteres?.toFixed(2)}%
                </span>
              </div>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-2xl"></div>
          </div>

          {/* 2. GRID DE DETALLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna A: Datos del Inmueble */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                <BuildingIcon /> Datos del Inmueble
              </h4>
              
              <div className="flex justify-between items-center group">
                <span className="text-gray-600 text-sm">Valor Inmueble</span>
                <span className="font-bold text-gray-800">{formatCurrency(simulation.valorInmueble)}</span>
              </div>
              
              <div className="flex justify-between items-center group">
                <span className="text-gray-600 text-sm">Cuota Inicial</span>
                <span className="font-bold text-green-600">- {formatCurrency(simulation.cuotaInicial)}</span>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-gray-700 text-sm font-medium">Monto a Financiar</span>
                <span className="font-bold text-blue-700">{formatCurrency(simulation.monto)}</span>
              </div>
            </div>

            {/* Columna B: Condiciones del Crédito */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                <CashIcon /> Condiciones
              </h4>

              <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Plazo</span>
                  <span className="font-bold text-gray-800">
                      {/* Usamos la función formatPlazo aquí */}
                      {formatPlazo()} 
                      <span className="text-gray-400 font-normal ml-1">
                          ({simulation.totalPagos} cuotas)
                      </span>
                  </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Moneda</span>
                <span className="font-bold text-gray-800">{simulation.moneda === 'PEN' ? 'Soles (S/)' : 'Dólares ($)'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Tipo de Inmueble</span>
                <span className="font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                  {simulation.concepto}
                </span>
              </div>
            </div>
          </div>

          {/* 3. TOTALES ESTIMADOS */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Proyección Total</h4>
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg">
              <div>
                <p className="text-gray-400 text-xs">Total Estimado a Pagar</p>
                <p className="text-xs opacity-60">(Capital + Intereses aprox.)</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(simulation.totalEstimado)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              * Nota: Este es un cálculo referencial basado en la cuota inicial. Puede variar según seguros y portes.
            </p>
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div className="bg-gray-50 p-5 border-t border-gray-200 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
          <button 
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            onClick={handleRecalculate}
          >
            <ChartIcon width={20} height={20} stroke="white" />
            Recalcular
          </button>
        </div>

      </div>
    </div>
  );
}