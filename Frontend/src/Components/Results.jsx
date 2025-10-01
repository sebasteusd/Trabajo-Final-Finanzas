import { ChartIcon, CardIcon, BonoIcon, HistoryIcon, CheckIcon, AspaIcon, AlertIcon, ReportIcon } from "../assets/icons";

export default function Results({ data }) {
  if (!data) return null;

  const formatCurrency = (value, currency = "PEN") => {
    const currencySymbol = currency === "USD" ? "US$" : "S/";
    return `${currencySymbol} ${new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}`;
  };

  const getVanStatusColor = (van) => {
    if (van === null) return "text-gray-500";
    return van >= 0 ? "text-green-600" : "text-red-600";
  };

const getVanStatusIcon = (van) => {
  if (van === null) return <AlertIcon width={16} height={16} stroke="currentColor" />;
  return van >= 0
    ? <CheckIcon width={16} height={16} stroke="currentColor" />
    : <AspaIcon width={16} height={16} stroke="currentColor" />;
};

  const getTirStatusColor = (tir) => {
    if (tir === null) return "text-gray-500";
    return tir >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-full">
          <ChartIcon width={28} height={28} fill="#1D4ED8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Resultados de la Simulación</h2>
      </div>

      {/* Métricas principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Cuota Mensual</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatCurrency(data.cuota_mensual)}
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <CardIcon width={28} height={28} fill="#1D4ED8" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total a Pagar</p>
              <p className="text-2xl font-bold text-purple-800">
                {formatCurrency(data.total_pagado)}
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <BonoIcon width={28} height={28} fill="#1D4ED8" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Intereses</p>
              <p className="text-2xl font-bold text-orange-800">
                {formatCurrency(data.intereses_pagados)}
              </p>
            </div>
            <div className="bg-orange-100 p-2 rounded-full">
              <HistoryIcon width={28} height={28} fill="#97711eff" />
            </div>
          </div>
        </div>
      </div>

      {/* Análisis financiero */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Análisis de Rentabilidad</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">VAN del Cliente</span>
              <span className="text-lg">
                {getVanStatusIcon(data.van_cliente)}
              </span>
            </div>
            <p className={`text-xl font-bold ${getVanStatusColor(data.van_cliente)}`}>
              {data.van_cliente !== null 
                ? formatCurrency(data.van_cliente)
                : "No disponible"
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.van_cliente !== null && (
                data.van_cliente >= 0 
                  ? "Inversión rentable" 
                  : "Inversión no rentable"
              )}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">TIR del Cliente</span>
              <ChartIcon width={20} height={20} stroke="currentColor" />
            </div>
            <p className={`text-xl font-bold ${getTirStatusColor(data.tir_cliente)}`}>
              {data.tir_cliente !== null 
                ? `${data.tir_cliente.toFixed(2)}%`
                : "No disponible"
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.tir_cliente !== null && "Tasa Interna de Retorno"}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen del crédito */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
        Resumen del Crédito
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monto solicitado:</span>
              <span className="font-semibold">{formatCurrency(data.monto_financiado || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cuota mensual:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(data.cuota_mensual)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total intereses:</span>
              <span className="font-semibold text-orange-600">{formatCurrency(data.intereses_pagados)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total a pagar:</span>
              <span className="font-semibold text-purple-600">{formatCurrency(data.total_pagado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de alerta */}
      {data.cuota_mensual && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertIcon width={28} height={28} fill="#97711eff" />
            <p className="text-sm text-yellow-800">
              <strong>Recomendación:</strong> La cuota mensual no debería superar el 30% de tus ingresos familiares.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}