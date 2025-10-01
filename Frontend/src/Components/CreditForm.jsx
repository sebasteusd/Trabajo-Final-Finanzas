import { useState } from "react";
import { CreditIcon, BonoIcon, RocketIcon, ReportIcon, AlertIcon, CheckIcon } from "../assets/icons";

export default function CreditForm({ onSimulate, loading }) {
  const [form, setForm] = useState({
    monto: 100000,
    tasa: 8.5,
    tipo_tasa: "efectiva",
    capitalizacion: "mensual", // Cambiado a string con valor por defecto
    plazo_meses: 240,
    moneda: "PEN",
    gracia: "ninguna",
    bono_techo_propio: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      monto: parseFloat(form.monto),
      tasa: parseFloat(form.tasa),
      plazo_meses: parseInt(form.plazo_meses),
      // Para tasa nominal: enviar capitalización como string
      // Para tasa efectiva: enviar null
      capitalizacion: form.tipo_tasa === "nominal" ? form.capitalizacion : null,
      bono_techo_propio: parseFloat(form.bono_techo_propio)
    };
    onSimulate(payload);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-PE').format(value);
  };

  const financedAmount = (form.monto || 0) - (form.bono_techo_propio || 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-full">
          <CreditIcon width={28} height={28} fill="#1D4ED8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Configuración del Crédito</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto del Inmueble
              </label>
              <div className="relative">
                <input 
                  name="monto" 
                  type="number" 
                  value={form.monto} 
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="100,000"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">
                  {form.moneda === "PEN" ? "S/" : "US$"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Valor total: {form.moneda === "PEN" ? "S/" : "US$"} {formatNumber(form.monto)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select 
                name="moneda" 
                value={form.moneda} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PEN">🇵🇪 Soles Peruanos (PEN)</option>
                <option value="USD">🇺🇸 Dólares Americanos (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuración de tasa */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Configuración de Tasa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Interés (%)
              </label>
              <input 
                name="tasa" 
                type="number" 
                value={form.tasa} 
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="8.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tasa
              </label>
              <select 
                name="tipo_tasa" 
                value={form.tipo_tasa} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="efectiva">Efectiva Anual</option>
                <option value="nominal">Nominal Anual</option>
              </select>
            </div>

            {form.tipo_tasa === "nominal" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capitalización
                </label>
                <select 
                  name="capitalizacion" 
                  value={form.capitalizacion} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="diaria">Diaria</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="cuatrimestral">Cuatrimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Términos del crédito */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Términos del Crédito</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plazo en Meses
              </label>
              <input 
                name="plazo_meses" 
                type="number" 
                value={form.plazo_meses} 
                onChange={handleChange}
                min="1"
                max="360"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="240"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(form.plazo_meses / 12)} años y {form.plazo_meses % 12} meses
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodo de Gracia
              </label>
              <select 
                name="gracia" 
                value={form.gracia} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ninguna">Sin periodo de gracia</option>
                <option value="parcial">Gracia parcial (solo intereses)</option>
                <option value="total">Gracia total (capitalización)</option>
              </select>
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                {form.gracia === "parcial" && (
                  <div className="flex items-center space-x-2">
                    <ReportIcon width={16} height={16} stroke="currentColor" />
                    <span>Solo pagas intereses durante la gracia</span>
                  </div>
                )}
                {form.gracia === "total" && (
                  <div className="flex items-center space-x-2">
                    <AlertIcon width={16} height={16} stroke="currentColor" />
                    <span>No pagas nada, intereses se capitalizan</span>
                  </div>
                )}
                {form.gracia === "ninguna" && (
                  <div className="flex items-center space-x-2">
                    <CheckIcon width={16} height={16} stroke="currentColor" />
                    <span>Pagas capital e intereses desde el inicio</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bono y financiamiento */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <BonoIcon width={28} height={28} fill="#079b1bff" />
            Bono Techo Propio
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto del Bono ({form.moneda === "PEN" ? "S/" : "US$"})
            </label>
            <input 
              name="bono_techo_propio" 
              type="number" 
              value={form.bono_techo_propio} 
              onChange={handleChange}
              min="0"
              max={form.monto}
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="0"
            />
            <div className="bg-white p-3 rounded-lg mt-3 border border-green-300">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor del inmueble:</span>
                <span className="font-semibold">
                  {form.moneda === "PEN" ? "S/" : "US$"} {formatNumber(form.monto)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bono Techo Propio:</span>
                <span className="font-semibold text-green-600">
                  - {form.moneda === "PEN" ? "S/" : "US$"} {formatNumber(form.bono_techo_propio)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-800">Monto a financiar:</span>
                <span className="font-bold text-blue-600">
                  {form.moneda === "PEN" ? "S/" : "US$"} {formatNumber(financedAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Calculando...
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <RocketIcon width={20} height={20} fill="white" />
              <span>Simular Crédito</span>
            </div>
          )}
        </button>

      </form>
    </div>
  );
}