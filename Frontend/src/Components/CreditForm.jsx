import { useState, useEffect } from "react";
import { CreditIcon, RocketIcon, IdeaIcon } from "../assets/icons"; 

// Asegúrate que este puerto coincida con tu backend (FastAPI por defecto es 8000)
const API_URL = "http://localhost:8000"; 

export default function CreditForm({ onSimulate, loading }) {
  // Estado para almacenar las entidades que vienen del Backend
  const [entidades, setEntidades] = useState([]);

  const [form, setForm] = useState({
    valor_inmueble: 125000,
    porcentaje_inicial: 20,
    
    entidad_financiera: "", // Nombre de la entidad seleccionada
    
    tasa: 8.5,
    tipo_tasa: "efectiva",
    capitalizacion: "mensual",
    plazo_meses: 240,
    moneda: "PEN", 
    tipo_cambio: 3.75, 
    gracia: "ninguna",
    bono_techo_propio: 0,
    
    frecuencia_pago: "mensual", 
    pct_seguro_desgravamen_anual: 0.05, 
    seguro_bien_monto: 20, 
    portes_monto: 5,
    cok: 15
  });

  // --- 1. CARGAR DATOS DEL BACKEND AL INICIAR ---
  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        // Nota: Agregamos "/api" a la ruta para coincidir con tu main.py
        const response = await fetch(`${API_URL}/api/financial/entities`);
        if (response.ok) {
          const data = await response.json();
          setEntidades(data);
        } else {
          console.error("Error al cargar entidades financieras");
        }
      } catch (error) {
        console.error("Error de conexión con el servidor:", error);
      }
    };
    fetchEntidades();
  }, []);

  // --- CÁLCULOS AUTOMÁTICOS ---
  const montoInicial = form.valor_inmueble * (form.porcentaje_inicial / 100);
  const montoPrestamo = form.valor_inmueble - montoInicial;
  const montoAFinanciarNeto = montoPrestamo - form.bono_techo_propio;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // --- 2. LÓGICA DE SELECCIÓN DE ENTIDAD (ACTUALIZADA) ---
  const handleEntidadChange = (e) => {
    const nombreSeleccionado = e.target.value;
    
    if (nombreSeleccionado === "") {
        // Opción: Omitir / Personalizado
        setForm({ 
            ...form, 
            entidad_financiera: "" 
            // Mantenemos los valores actuales para edición manual
        });
    } else {
        // Buscamos la entidad en el array cargado del backend
        const entidad = entidades.find(e => e.nombre === nombreSeleccionado);
        
        if (entidad) {
            // --- CONVERSIONES ---
            // 1. Tasa: Backend (0.095) -> Frontend (9.5)
            const tasaPct = (entidad.tasa_referencial * 100).toFixed(2);
            
            // 2. Desgravamen: Backend (Mensual Decimal) -> Frontend (Anual Porcentual)
            // Ejemplo: 0.00066 * 12 meses * 100% = 0.792% anual
            const desgravamenAnualPct = (entidad.seguro_desgravamen * 12 * 100).toFixed(4);

            // 3. Seguro Bien: Backend (Factor Mensual) -> Frontend (Monto Fijo)
            // Ejemplo: 125000 * 0.00026 = 32.50
            const seguroBienCalculado = (form.valor_inmueble * entidad.seguro_inmueble).toFixed(2);

            setForm({ 
                ...form, 
                entidad_financiera: nombreSeleccionado,
                tasa: tasaPct,
                pct_seguro_desgravamen_anual: desgravamenAnualPct,
                seguro_bien_monto: seguroBienCalculado,
                portes_monto: entidad.gastos_administrativos
            });
        }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Si no se seleccionó ninguna entidad de la lista, enviamos "Personalizado"
    const nombreFinal = form.entidad_financiera || "Personalizado";

    const payload = {
      ...form,
      monto: parseFloat(montoPrestamo), 
      entidad_financiera: nombreFinal,
      tasa: parseFloat(form.tasa),
      plazo_meses: parseInt(form.plazo_meses),
      capitalizacion: form.tipo_tasa === "nominal" ? form.capitalizacion : null,
      bono_techo_propio: parseFloat(form.bono_techo_propio),
      frecuencia_pago: form.frecuencia_pago,
      pct_seguro_desgravamen_anual: parseFloat(form.pct_seguro_desgravamen_anual),
      seguro_bien_monto: parseFloat(form.seguro_bien_monto),
      portes_monto: parseFloat(form.portes_monto),
      cok: parseFloat(form.cok) || 0,
      tipo_cambio: parseFloat(form.tipo_cambio)
    };
    onSimulate(payload);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(value);
  };

  const currencySymbol = form.moneda === "PEN" ? "S/" : "US$";

  const getConvertedValue = (amount) => {
    if (!form.tipo_cambio || form.tipo_cambio <= 0) return "";
    if (form.moneda === "PEN") {
      const inUSD = amount / form.tipo_cambio;
      return `≈ US$ ${formatNumber(inUSD)}`;
    } else {
      const inPEN = amount * form.tipo_cambio;
      return `≈ S/ ${formatNumber(inPEN)}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-full">
          <CreditIcon width={28} height={28} fill="#1D4ED8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Configuración del Crédito</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- ESTRUCTURA DEL PRÉSTAMO --- */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
             <IdeaIcon width={20} height={20} fill="#1e3a8a" className="mr-2" />
             Estructura de Financiamiento
          </h3>
          
          <div className="space-y-4">
            {/* 1. Valor del Inmueble */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor del Inmueble
              </label>
              <div className="relative">
                <input 
                  name="valor_inmueble" 
                  type="number" 
                  value={form.valor_inmueble} 
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-3 pr-10 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-800" 
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm font-bold">
                  {currencySymbol}
                </span>
              </div>
              <p className="text-xs text-blue-600 text-right mt-1 font-medium">
                {getConvertedValue(form.valor_inmueble)}
              </p>
            </div>

            {/* 2. Cuota Inicial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  % Cuota Inicial
                </label>
                <div className="relative">
                  <input 
                    name="porcentaje_inicial" 
                    type="number" 
                    value={form.porcentaje_inicial} 
                    onChange={handleChange}
                    min="0"
                    max="90"
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Inicial
                </label>
                <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 font-medium text-right">
                  {currencySymbol} {formatNumber(montoInicial)}
                </div>
              </div>
            </div>

            {/* 3. Monto del Préstamo */}
            <div className="pt-2 border-t border-blue-200 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-900">Monto del Préstamo:</span>
                <div className="text-right">
                  <span className="block text-xl font-bold text-blue-700">
                    {currencySymbol} {formatNumber(montoPrestamo)}
                  </span>
                  <span className="text-xs text-blue-500 font-medium">
                    {getConvertedValue(montoPrestamo)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- NUEVA SECCIÓN: ENTIDAD FINANCIERA (DINÁMICA) --- */}
        <div className="bg-gray-50 p-4 rounded-lg">
           <h3 className="text-lg font-medium text-gray-800 mb-4">Entidad Financiera</h3>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Seleccionar Entidad
             </label>
             <select 
               name="entidad_financiera"
               value={form.entidad_financiera}
               onChange={handleEntidadChange}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
             >
               <option value="">-- Omitir (Ingresar tasa manual) --</option>
               
               {/* Mapeamos el estado "entidades" que viene del backend */}
               {entidades.map((entidad) => (
                 <option key={entidad.id_entidad || entidad.nombre} value={entidad.nombre}>
                   {entidad.nombre}
                 </option>
               ))}
             </select>
           </div>
        </div>

        {/* --- CONDICIONES FINANCIERAS --- */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Condiciones Financieras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda del Préstamo</label>
              <select 
                name="moneda" 
                value={form.moneda} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PEN">🇵🇪 Soles (PEN)</option>
                <option value="USD">🇺🇸 Dólares (USD)</option>
              </select>
            </div>

            {/* TIPO DE CAMBIO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>Tipo de Cambio</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Referencial</span>
              </label>
              <div className="relative">
                <input 
                  name="tipo_cambio" 
                  type="number" 
                  value={form.tipo_cambio} 
                  onChange={handleChange}
                  step="0.001"
                  className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">S/</span>
                </div>
              </div>
            </div>

            {/* Plazo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plazo (Meses)</label>
              <input 
                name="plazo_meses" 
                type="number" 
                value={form.plazo_meses} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            {/* Tasa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tasa Interés (%)</label>
              <input 
                name="tasa" 
                type="number" 
                value={form.tasa} 
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            {/* Tipo Tasa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Tasa</label>
              <select 
                name="tipo_tasa" 
                value={form.tipo_tasa} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="efectiva">Efectiva Anual</option>
                <option value="nominal">Nominal Anual</option>
              </select>
            </div>

            {/* Frecuencia de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Pago</label>
              <select 
                name="frecuencia_pago" 
                value={form.frecuencia_pago} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

            {form.tipo_tasa === "nominal" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Capitalización</label>
                <select 
                  name="capitalizacion" 
                  value={form.capitalizacion} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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

                {/* Costos Adicionales */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Costos Adicionales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Seguro de Desgravamen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seg. Desgravamen (%)
              </label>
              <input 
                name="pct_seguro_desgravamen_anual" 
                type="number" 
                value={form.pct_seguro_desgravamen_anual} 
                onChange={handleChange}
                min="0"
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            {/* Seguro del Bien */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seguro del Inmueble
              </label>
              <input 
                name="seguro_bien_monto" 
                type="number" 
                value={form.seguro_bien_monto} 
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            {/* Portes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portes / Gastos
              </label>
              <input 
                name="portes_monto" 
                type="number" 
                value={form.portes_monto} 
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ingresa los costos mensuales. El backend los ajustará automáticamente si la frecuencia de pago no es mensual.
          </p>
        </div>

        {/* Bono y Periodo de Gracia */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
           <h3 className="text-lg font-medium text-gray-800 mb-4">Beneficios y Periodos</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Periodo de Gracia</label>
               <select name="gracia" value={form.gracia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                 <option value="ninguna">Sin periodo de gracia</option>
                 <option value="parcial">Gracia parcial (Paga Interés)</option>
                 <option value="total">Gracia total (Capitaliza)</option>
               </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bono Techo Propio</label>
                <input name="bono_techo_propio" type="number" value={form.bono_techo_propio} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
             </div>
           </div>
           
           {/* Resumen Final de Capital */}
           <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg text-sm shadow-sm">
              <div className="flex justify-between mb-1 text-gray-600">
                 <span>Monto Préstamo Inicial:</span>
                 <span>{currencySymbol} {formatNumber(montoPrestamo)}</span>
              </div>
              <div className="flex justify-between mb-1 text-green-600 font-medium">
                 <span>- Bono Techo Propio:</span>
                 <span>{currencySymbol} {formatNumber(form.bono_techo_propio)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                 <span className="font-bold text-gray-800">Capital Final a Financiar:</span>
                 <div className="text-right">
                    <span className="block font-bold text-blue-700 text-lg">{currencySymbol} {formatNumber(montoAFinanciarNeto)}</span>
                    <span className="text-xs text-blue-500 font-medium">{getConvertedValue(montoAFinanciarNeto)}</span>
                 </div>
              </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-[1.02] ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg"
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