import { useState } from "react";
import { ChartIcon, CardIcon, BonoIcon, HistoryIcon, CheckIcon, AspaIcon, AlertIcon, IdeaIcon } from "../assets/icons";

// Icono para el Banco
const BankIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 22H2V20H4V22ZM22 20H20V22H22V20ZM11 22H13V20H11V22ZM7 22H9V20H7V22ZM15 22H17V20H15V22ZM4 10V18H20V10H4ZM12 2L2 7V9H22V7L12 2Z" /></svg>
);

// Icono para Costo del Crédito
const PriceTagIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.79 5.23l-3.02 3.02a1.5 1.5 0 0 1-2.12 0L5.23 5.83a1.5 1.5 0 0 1 0-2.12l3.02-3.02a1.5 1.5 0 0 1 2.12 0l2.42 2.42a1.5 1.5 0 0 1 0 2.12zM11.66 12.34l-.66-.66 2.42-2.42a2.5 2.5 0 0 0 0-3.54l-3.02-3.02a2.5 2.5 0 0 0-3.54 0L4.44 5.12a2.5 2.5 0 0 0 0 3.54l3.02 3.02a2.5 2.5 0 0 0 3.54 0l.66.66a1.5 1.5 0 0 0 0 2.12l6.06 6.06a1.5 1.5 0 0 0 2.12 0l3.02-3.02a1.5 1.5 0 0 0 0-2.12l-6.06-6.06a1.5 1.5 0 0 0-2.12 0z" /></svg>
);

export default function Results({ data, inputs, onSave, saving }) {
  if (!data) return null;

  const formatCurrency = (value, currency = "PEN") => {
    const currencySymbol = inputs?.moneda === "USD" ? "US$" : "S/";
    const val = Object.is(value, -0) ? 0 : value;
    return `${currencySymbol} ${new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)}`;
  };

  const freqLabel = data.frecuencia_pago
    ? data.frecuencia_pago.charAt(0).toUpperCase() + data.frecuencia_pago.slice(1)
    : "Período";

  const primeraCuota = data.tabla_amortizacion && data.tabla_amortizacion.length > 0
    ? data.tabla_amortizacion[1].cuota_total
    : 0;

  const montoFinanciado = data.monto || (data.tabla_amortizacion[0]?.saldo + data.tabla_amortizacion[0]?.amortizacion) || 0;

  // === CÁLCULO DEL COSTO DE CRÉDITO ===
  const costoTotalCredito = data.total_pagado - montoFinanciado;

  const getVanStatusColor = (van) => {
    if (van === null || van === undefined) return "text-gray-500";
    return van >= 0 ? "text-green-600" : "text-red-600";
  };

  const getVanStatusIcon = (van) => {
    if (van === null || van === undefined) return <AlertIcon width={16} height={16} stroke="currentColor" />;
    return van >= 0
      ? <CheckIcon width={16} height={16} stroke="currentColor" />
      : <AspaIcon width={16} height={16} stroke="currentColor" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative font-['Poppins']">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <ChartIcon width={28} height={28} fill="#1D4ED8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Resultados de la Simulación</h2>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
            saving 
              ? "bg-gray-100 text-gray-400 cursor-wait" 
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md"
          }`}
        >
            {saving ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Guardando...</span>
                </>
            ) : (
                <>
                    <CheckIcon width={18} height={18} stroke="currentColor" /> 
                    <span>Guardar Simulación</span>
                </>
            )}
        </button>
      </div>

      {/* --- 1. RESUMEN PRINCIPAL (4 TARJETAS) --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Card 1: Primera Cuota */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-1">
             <p className="text-xs font-semibold uppercase text-blue-600">1ra Cuota</p>
             <CardIcon width={24} height={24} fill="#1D4ED8" />
          </div>
          <p className="text-xl font-bold text-blue-800">
            {formatCurrency(primeraCuota)}
          </p>
          <p className="text-[10px] text-blue-500 font-medium">Pago {freqLabel.toLowerCase()}</p>
        </div>

        {/* Card 2: Total a Pagar */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-1">
             <p className="text-xs font-semibold uppercase text-purple-600">Total a Pagar</p>
             <BonoIcon width={24} height={24} fill="#7e22ce" />
          </div>
          <p className="text-xl font-bold text-purple-800">
            {formatCurrency(data.total_pagado)}
          </p>
          <p className="text-[10px] text-purple-500 font-medium">Capital + Intereses + Seguros</p>
        </div>

        {/* Card 3: Intereses */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-1">
             <p className="text-xs font-semibold uppercase text-orange-600">Intereses</p>
             <HistoryIcon width={24} height={24} fill="#c2410c" />
          </div>
          <p className="text-xl font-bold text-orange-800">
            {formatCurrency(data.intereses_pagados)}
          </p>
          <p className="text-[10px] text-orange-600 font-medium">Costo del dinero</p>
        </div>

        {/* Card 4: COSTO DEL CRÉDITO */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-1">
             <p className="text-xs font-semibold uppercase text-rose-600">Costo Crédito</p>
             <PriceTagIcon width={24} height={24} fill="#e11d48" />
          </div>
          <p className="text-xl font-bold text-rose-800">
            {formatCurrency(costoTotalCredito)}
          </p>
          <p className="text-[10px] text-rose-500 font-medium">Intereses + Seguros + Gastos</p>
        </div>

      </div>

      {/* --- 2. DETALLES DE TASA --- */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles de la Tasa</h3>
        <div className="grid md:grid-cols-2 gap-4">
          
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Tasa Efectiva Mensual (TEM)</span>
              <IdeaIcon width={20} height={20} fill="#afd81dff" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {(data.tasa_efectiva_mensual).toFixed(6)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tasa mensual equivalente.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Tasa Efectiva del Período</span>
              <ChartIcon width={20} height={20} stroke="currentColor" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {(data.tasa_efectiva_periodo).toFixed(6)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tasa aplicada en cada {freqLabel.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>

      {/* --- 3. INDICADORES FINANCIEROS (GRID 2x2) --- */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
           <ChartIcon width={20} height={20} fill="#374151" />
           Indicadores Financieros (Perspectiva de Inversión)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* A. VAN CLIENTE */}
          <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-sm font-medium text-gray-600">VAN Cliente (Costo)</span>
              <AlertIcon width={20} height={20} fill="#EF4444" />
            </div>
            <p className="text-xl font-bold text-red-600 relative z-10">
              {formatCurrency(data.van_cliente)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 relative z-10">
              Valor Presente de los costos financieros.
            </p>
          </div>

          {/* B. VAN BANCO */}
          <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-sm font-medium text-gray-600">VAN Banco (Retorno)</span>
              <BankIcon width={20} height={20} fill="#10B981" />
            </div>
            <p className="text-xl font-bold text-green-600 relative z-10">
              {formatCurrency(data.van_banco)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 relative z-10">
              Valor Presente Neto para la entidad.
            </p>
          </div>

          {/* C. TIR MENSUAL */}
          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">TIR {freqLabel} (Real)</span>
              <IdeaIcon width={20} height={20} fill="#3B82F6" />
            </div>
            <p className="text-xl font-bold text-blue-600">
              {data.tir_mensual ? `${data.tir_mensual.toFixed(4)}%` : "-"}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Costo efectivo total por período.
            </p>
          </div>

          {/* D. TCEA */}
          <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">TCEA (Anualizada)</span>
              <ChartIcon width={20} height={20} stroke="#8B5CF6" />
            </div>
            <p className="text-xl font-bold text-purple-600">
              {data.tcea ? `${data.tcea.toFixed(2)}%` : "-"}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Tasa de Costo Efectivo Anual.
            </p>
          </div>

        </div>
      </div>

      {/* --- RESUMEN FINAL --- */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          Resumen del Crédito
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monto financiado:</span>
              <span className="font-bold text-gray-800">{formatCurrency(montoFinanciado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Num. de Pagos:</span>
              <span className="font-bold text-blue-600">{data.numero_de_periodos}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total intereses:</span>
              <span className="font-bold text-orange-600">{formatCurrency(data.intereses_pagados)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total a pagar:</span>
              <span className="font-bold text-purple-600">{formatCurrency(data.total_pagado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta */}
      {primeraCuota > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertIcon width={28} height={28} fill="#97711eff" />
            <p className="text-sm text-yellow-800">
              <strong>Recomendación:</strong> Tu primera cuota de <b className="font-semibold">{formatCurrency(primeraCuota)}</b> no debería superar el 30% de tus ingresos familiares.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}