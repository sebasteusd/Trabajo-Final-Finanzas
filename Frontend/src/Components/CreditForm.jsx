import { useState, useEffect } from "react";
import { CreditIcon, RocketIcon, IdeaIcon } from "../assets/icons"; 

const API_URL = "http://localhost:8000"; 

export default function CreditForm({ onSimulate, loading, initialData, user }) {
  const [entidades, setEntidades] = useState([]);

  const [form, setForm] = useState({
    valor_inmueble: 125000,
    porcentaje_inicial: 20,
    entidad_financiera: "", 
    tasa: 8.5,
    tipo_tasa: "efectiva",
    capitalizacion: "mensual",
    plazo_meses: 240,
    moneda: "PEN", 
    tipo_cambio: 3.75, 
    gracia: "ninguna",
    bono_techo_propio: 0,
    frecuencia_pago: "mensual", 
    pct_seguro_desgravamen_anual: 0.0500,
    seguro_bien_monto: 20, 
    portes_monto: 5,
    cok: 15,
    id_unidad: null,
    concepto_temporal: "Propiedad"
  });

  // --- ELEGIBILIDAD BONO TECHO PROPIO (Reglas simplificadas, mismas que el backend) ---
  const MAX_INGRESOS_AVN = 3715.0;
  const [eligibility, setEligibility] = useState({ isEligible: null, reason: "" });
  const [applyBono, setApplyBono] = useState(false);

  useEffect(() => {
    // Si no hay usuario o no tiene client, pedimos completar perfil
    const client = user?.client;
    if (!user || !client) {
      setEligibility({ isEligible: null, reason: "Completa tu perfil para evaluar la elegibilidad." });
      return;
    }

    const ingresos = parseFloat(client.ingresos_mensuales || 0);
    if (ingresos > MAX_INGRESOS_AVN) {
      setEligibility({ isEligible: false, reason: `Ingreso familiar mensual (S/ ${ingresos.toFixed(2)}) excede el límite (${MAX_INGRESOS_AVN}).` });
      return;
    }

    const estado = (client.estado_civil || "soltero").toLowerCase();
    if (estado !== "casado" && estado !== "conviviente") {
      if (estado === "soltero" && (parseInt(client.numero_hijos || 0) < 1)) {
        setEligibility({ isEligible: false, reason: "Si eres soltero(a) debes declarar al menos 1 hijo para conformar el grupo familiar." });
        return;
      }
    }

    if (!client.no_propiedad_previa) {
      setEligibility({ isEligible: false, reason: "Debes declarar no ser propietario de otra vivienda/terreno (requisito BFH)." });
      return;
    }

    if (!client.no_bono_previo) {
      setEligibility({ isEligible: false, reason: "Debes declarar no haber recibido un bono habitacional previo (requisito BFH)." });
      return;
    }

    setEligibility({ isEligible: true, reason: "APTO. Cumples los requisitos para postular al Bono Techo Propio (AVN)." });
  }, [user]);

  // Si no es elegible, forzamos bono a 0 para evitar modificaciones
  // Fijar monto del bono: S/46,545 cuando es elegible, 0 en caso contrario
  useEffect(() => {
    const MONTO_FIJO_BONO = 46545;
    if (eligibility.isEligible === true) {
      // por defecto activamos la casilla cuando el usuario es elegible
      setApplyBono(true);
      setForm(prev => ({ ...prev, bono_techo_propio: MONTO_FIJO_BONO }));
    } else if (eligibility.isEligible === false) {
      setApplyBono(false);
      setForm(prev => ({ ...prev, bono_techo_propio: 0 }));
    } else {
      // perfil incompleto
      setApplyBono(false);
      setForm(prev => ({ ...prev, bono_techo_propio: 0 }));
    }
  }, [eligibility.isEligible]);

  const handleApplyBonoToggle = (e) => {
    const checked = e.target.checked;
    const MONTO_FIJO_BONO = 46545;
    setApplyBono(checked);
    setForm(prev => ({ ...prev, bono_techo_propio: checked ? MONTO_FIJO_BONO : 0 }));
  };

  // --- AUTO-RELLENAR ---
  useEffect(() => {
    if (initialData) {
      setForm(prev => ({
        ...prev,
        valor_inmueble: parseFloat(initialData.price),
        id_unidad: initialData.id,
        concepto_temporal: initialData.type || "Propiedad",
      }));
    }
  }, [initialData]);

  // --- CARGAR ENTIDADES ---
  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        const response = await fetch(`${API_URL}/api/financial/entities`);
        if (response.ok) {
          const data = await response.json();
          setEntidades(data);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      }
    };
    fetchEntidades();
  }, []);

  const montoInicial = form.valor_inmueble * (form.porcentaje_inicial / 100);
  const montoPrestamo = form.valor_inmueble - montoInicial;
  const montoAFinanciarNeto = montoPrestamo - form.bono_techo_propio;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCurrencyChange = (e) => {
    const nuevaMoneda = e.target.value;
    const monedaAnterior = form.moneda;
    const tc = parseFloat(form.tipo_cambio);

    if (nuevaMoneda === monedaAnterior || !tc || tc <= 0) {
        setForm({ ...form, moneda: nuevaMoneda });
        return;
    }

    let factor = 1;
    if (monedaAnterior === "PEN" && nuevaMoneda === "USD") {
        factor = 1 / tc; 
    } else if (monedaAnterior === "USD" && nuevaMoneda === "PEN") {
        factor = tc;     
    }

    setForm(prev => ({
        ...prev,
        moneda: nuevaMoneda,
        valor_inmueble: parseFloat((prev.valor_inmueble * factor).toFixed(2)),
        bono_techo_propio: parseFloat((prev.bono_techo_propio * factor).toFixed(2)),
        seguro_bien_monto: parseFloat((prev.seguro_bien_monto * factor).toFixed(2)),
        portes_monto: parseFloat((prev.portes_monto * factor).toFixed(2)),
    }));
  };

  const handleEntidadChange = (e) => {
    const nombreSeleccionado = e.target.value;
    if (nombreSeleccionado === "") {
        setForm({ ...form, entidad_financiera: "" });
    } else {
        const entidad = entidades.find(e => e.nombre === nombreSeleccionado);
        if (entidad) {
            const tasaPct = (entidad.tasa_referencial * 100).toFixed(2);
            const desgravamenPct = (entidad.seguro_desgravamen * 100).toFixed(4); 
            const seguroBienCalculado = (form.valor_inmueble * entidad.seguro_inmueble).toFixed(2);

            setForm({ 
                ...form, 
                entidad_financiera: nombreSeleccionado,
                tasa: tasaPct,
                pct_seguro_desgravamen_anual: desgravamenPct,
                seguro_bien_monto: seguroBienCalculado,
                portes_monto: entidad.gastos_administrativos
            });
        }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nombreFinal = form.entidad_financiera || "Personalizado";
    const payload = {
      ...form,
      monto: parseFloat(montoPrestamo), 
      entidad_financiera: nombreFinal,
      tasa: parseFloat(form.tasa),
      plazo_meses: parseInt(form.plazo_meses),
      capitalizacion: form.tipo_tasa === "nominal" ? form.capitalizacion : null,
      bono_techo_propio: parseFloat(form.bono_techo_propio),
      pct_seguro_desgravamen_anual: parseFloat(form.pct_seguro_desgravamen_anual),
      seguro_bien_monto: parseFloat(form.seguro_bien_monto),
      portes_monto: parseFloat(form.portes_monto),
      cok: parseFloat(form.cok) || 0,
      tipo_cambio: parseFloat(form.tipo_cambio),
      id_unidad: form.id_unidad,
      concepto_temporal: form.concepto_temporal
    };
    onSimulate(payload);
  };

  const formatNumber = (value) => new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const currencySymbol = form.moneda === "PEN" ? "S/" : "US$";

  const getConvertedValue = (amount) => {
    if (!form.tipo_cambio || form.tipo_cambio <= 0) return "";
    if (form.moneda === "PEN") {
      return `≈ US$ ${formatNumber(amount / form.tipo_cambio)}`;
    } else {
      return `≈ S/ ${formatNumber(amount * form.tipo_cambio)}`;
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor del Inmueble</label>
              <div className="relative">
                <input name="valor_inmueble" type="number" value={form.valor_inmueble} onChange={handleChange} min="0" step="0.01" className="w-full pl-3 pr-10 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm font-bold">{currencySymbol}</span>
              </div>
              <p className="text-xs text-blue-600 text-right mt-1 font-medium">{getConvertedValue(form.valor_inmueble)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Cuota Inicial</label>
                <div className="relative">
                  <input name="porcentaje_inicial" type="number" value={form.porcentaje_inicial} onChange={handleChange} min="0" max="90" className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial</label>
                <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 font-medium text-right">{currencySymbol} {formatNumber(montoInicial)}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-900">Monto del Préstamo:</span>
                <div className="text-right">
                  <span className="block text-xl font-bold text-blue-700">{currencySymbol} {formatNumber(montoPrestamo)}</span>
                  <span className="text-xs text-blue-500 font-medium">{getConvertedValue(montoPrestamo)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ENTIDAD FINANCIERA --- */}
        <div className="bg-gray-50 p-4 rounded-lg">
           <h3 className="text-lg font-medium text-gray-800 mb-4">Entidad Financiera</h3>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Entidad</label>
             <select name="entidad_financiera" value={form.entidad_financiera} onChange={handleEntidadChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
               <option value="">-- Omitir (Ingresar tasa manual) --</option>
               {entidades.map((entidad) => (
                 <option key={entidad.id_entidad || entidad.nombre} value={entidad.nombre}>{entidad.nombre}</option>
               ))}
             </select>
           </div>
        </div>

        {/* --- CONDICIONES FINANCIERAS --- */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Condiciones Financieras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda del Préstamo</label>
              <select name="moneda" value={form.moneda} onChange={handleCurrencyChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="PEN">🇵🇪 Soles (PEN)</option>
                <option value="USD">🇺🇸 Dólares (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between"><span>Tipo Cambio</span><span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Referencial</span></label>
              <div className="relative">
                <input name="tipo_cambio" type="number" value={form.tipo_cambio} onChange={handleChange} step="0.001" className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 text-sm">S/</span></div>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Plazo (Meses)</label><input name="plazo_meses" type="number" value={form.plazo_meses} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Tasa Interés (%)</label><input name="tasa" type="number" value={form.tasa} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Tasa</label>
              <select name="tipo_tasa" value={form.tipo_tasa} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="efectiva">Efectiva Anual</option><option value="nominal">Nominal Anual</option></select>
            </div>
            
            {/* === FRECUENCIA DE PAGO COMPLETA === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Pago</label>
              <select name="frecuencia_pago" value={form.frecuencia_pago} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
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

            {/* === CAPITALIZACIÓN COMPLETA (Solo si es Nominal) === */}
            {form.tipo_tasa === "nominal" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Capitalización</label>
                <select name="capitalizacion" value={form.capitalizacion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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

        {/* --- COSTOS ADICIONALES --- */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Costos Adicionales (Mensuales)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 h-10 flex items-end pb-1">Seg. Desgravamen (%)</label>
              <div className="relative">
                <input name="pct_seguro_desgravamen_anual" type="number" value={form.pct_seguro_desgravamen_anual} onChange={handleChange} min="0" step="0.0001" className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">≈ {currencySymbol} {formatNumber(montoPrestamo * (form.pct_seguro_desgravamen_anual / 100))} <br/> mensuales</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 h-10 flex items-end pb-1">Seguro del Inmueble</label>
              <div className="relative">
                <input name="seguro_bien_monto" type="number" value={form.seguro_bien_monto} onChange={handleChange} min="0" step="0.01" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm font-bold">{currencySymbol}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">≈ {((form.seguro_bien_monto / form.valor_inmueble) * 100).toFixed(4)}% <br/> del valor inmueble</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 h-10 flex items-end pb-1">Portes / Gastos</label>
              <div className="relative">
                <input name="portes_monto" type="number" value={form.portes_monto} onChange={handleChange} min="0" step="0.01" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm font-bold">{currencySymbol}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">Costo fijo administrativo <br/> mensual</p>
            </div>
          </div>
        </div>

        {/* --- BONO Y GRACIA --- */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
           <h3 className="text-lg font-medium text-gray-800 mb-4">Beneficios y Periodos</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Periodo de Gracia</label>
               <select name="gracia" value={form.gracia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                 <option value="ninguna">Sin periodo de gracia</option>
                 <option value="parcial">Gracia parcial (Paga Interés)</option>
                 <option value="total">Gracia total (Capitaliza)</option>
               </select>
             </div>
             <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Bono Techo Propio</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="applyBono"
                      type="checkbox"
                      checked={applyBono}
                      onChange={handleApplyBonoToggle}
                      disabled={eligibility.isEligible !== true}
                      className={`h-4 w-4 ${eligibility.isEligible === true ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      title={eligibility.isEligible === true ? 'Marcar para aplicar el Bono Techo Propio' : eligibility.reason}
                    />
                    <label htmlFor="applyBono" className={`${eligibility.isEligible === true ? 'text-gray-700' : 'text-gray-400'} text-sm`}>Aplicar Bono</label>
                  </div>
                </div>

                <input
                  name="bono_techo_propio"
                  type="number"
                  value={form.bono_techo_propio}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  title={eligibility.isEligible === true ? `Bono fijado: S/46,545 (no modificable)` : (eligibility.isEligible === false ? eligibility.reason : "Completa tu perfil para evaluar el bono")}
                />
             </div>
           </div>
           
             <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg text-sm shadow-sm">
              <div className="flex justify-between mb-1 text-gray-600">
                 <span>Monto Préstamo Inicial:</span>
                 <span>{currencySymbol} {formatNumber(montoPrestamo)}</span>
              </div>
              <div className="flex justify-between mb-1 text-green-600 font-medium">
                 <span>- Bono Techo Propio:</span>
                 <span>{currencySymbol} {formatNumber(form.bono_techo_propio)}</span>
              </div>

              {/* Mensaje de elegibilidad y control del input del bono */}
              <div className="mt-3">
                {eligibility.isEligible === true && (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-2 rounded">
                    {eligibility.reason}
                  </div>
                )}
                {eligibility.isEligible === false && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded">
                    <div className="font-semibold">No aplica para el Bono</div>
                    <div className="text-sm">{eligibility.reason}</div>
                  </div>
                )}
                {eligibility.isEligible === null && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded">{eligibility.reason}</div>
                )}
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