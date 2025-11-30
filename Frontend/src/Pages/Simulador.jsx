import { useState } from "react";
import { useLocation } from "react-router-dom";
import CreditForm from "../Components/CreditForm";
import Results from "../Components/Results";
import AmortizationTable from "../Components/AmortizacionTable";
import { ChartIcon } from "../assets/icons";

export default function Simulador({ user, token, view, users }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NUEVO ESTADO: Para guardar los inputs de la simulación actual ---
  const [currentSimulationParams, setCurrentSimulationParams] = useState(null);
  
  // --- NUEVO ESTADO: Loading del guardado ---
  const [saving, setSaving] = useState(false);

  // 2. CAPTURAR LOS DATOS DE LA PROPIEDAD (SI EXISTEN)
  const location = useLocation();
  const propertyFromNavigation = location.state?.propertyData;

  const simulateCredit = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8000/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error("Error en la simulación");
      }
      
      const data = await res.json();
      setResult(data);

      // --- GUARDAMOS LOS PARÁMETROS PARA USARLOS AL GUARDAR EN BD ---
      setCurrentSimulationParams(payload);

    } catch (error) {
      console.error("Error al simular:", error);
      setError("Error al realizar la simulación. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

    const handleSaveSimulation = async () => {
        if (!result || !currentSimulationParams) return;

        try {
          setSaving(true);

          const primeraFilaPago = result.tabla_amortizacion.find(fila => fila.periodo === 1);
          const cuotaParaGuardar = primeraFilaPago ? primeraFilaPago.cuota_total : 0;

          const savePayload = {
            nombre_producto_credito: currentSimulationParams.entidad_financiera || "Crédito Personalizado",
            // Si viene de una propiedad, usamos su ID, sino null
            id_unidad: currentSimulationParams.id_unidad || null, 
            // Si viene de una propiedad, usamos su tipo (ej: Casa), sino "Propiedad"
            concepto_temporal: currentSimulationParams.concepto_temporal || "Propiedad", 
            
            moneda: currentSimulationParams.moneda,
            valor_inmueble: parseFloat(currentSimulationParams.valor_inmueble),
            cuota_inicial: parseFloat(currentSimulationParams.valor_inmueble) * (parseFloat(currentSimulationParams.porcentaje_inicial) / 100),
            monto_financiado: parseFloat(currentSimulationParams.monto) - parseFloat(currentSimulationParams.bono_techo_propio || 0),
            plazo_anios: Math.ceil(parseInt(currentSimulationParams.plazo_meses) / 12),
            tasa_interes_aplicada: parseFloat(result.tasa_efectiva_periodo),
            cuota_mensual_estimada: parseFloat(cuotaParaGuardar),
            total_pagado: parseFloat(result.total_pagado)
          };

      const res = await fetch("http://localhost:8000/api/simulations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(savePayload),
      });

      if (!res.ok) {
        throw new Error("Error al guardar la simulación");
      }

      alert("¡Simulación guardada correctamente! Puedes verla en 'Mis Simulaciones'.");

    } catch (err) {
      console.error("Error saving:", err);
      alert("Hubo un error al guardar la simulación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="max-w-[1700px] mx-auto px-6 py-4">
        {view === "tsa" && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Simulador de Créditos Hipotecarios
              </h2>
              
              {/* MENSAJE OPCIONAL: Avisar al usuario que está simulando una propiedad específica */}
              {propertyFromNavigation && (
                 <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block mb-2 font-medium animate-fade-in-up">
                    🏡 Simulando para: {propertyFromNavigation.address}
                 </div>
              )}

              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Calcula tus cuotas y guarda tus escenarios para compararlos luego.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="grid lg:grid-cols-6 gap-6">
              <div className="lg:col-span-2">
                {/* 3. PASAR LOS DATOS AL FORMULARIO */}
                <CreditForm 
                  onSimulate={simulateCredit} 
                  loading={loading} 
                  initialData={propertyFromNavigation} 
                  user={user}
                  token={token}
                />
              </div>

              <div className="lg:col-span-4">    
                {loading ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Calculando proyecciones financieras...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-6 animate-fade-in-up">
                    <Results 
                        data={result} 
                        inputs={currentSimulationParams} 
                        onSave={handleSaveSimulation}
                        saving={saving}
                    />
                    <AmortizationTable 
                    tabla={result?.tabla_amortizacion} 
                    frecuencia={result?.frecuencia_pago} 
                    // AGREGAMOS ESTE OBJETO 'resumen'
                      resumen={{
                          totalPagado: result.total_pagado,
                          totalIntereses: result.intereses_pagados,
                      }}
                                      
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center min-h-[400px] flex flex-col justify-center items-center">
                    <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                      <ChartIcon width={48} height={48} fill="#1D4ED8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Empieza tu simulación
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Completa los datos del inmueble y financiamiento en el panel izquierdo para generar tu tabla de amortización detallada.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {view === "users" && user?.role === "admin" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Gestión de Usuarios
              </h2>
              <div className="text-sm text-gray-600">
                Total: {users.length} usuarios
              </div>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">👥</span>
                </div>
                <p className="text-gray-600">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {u.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{u.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}