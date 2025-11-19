import { useState } from "react";
import CreditForm from "../Components/CreditForm";
import Results from "../Components/Results";
import AmortizationTable from "../Components/AmortizacionTable";
import { ChartIcon } from "../assets/icons";

export default function Simulador({ user, token, view, users }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (error) {
      console.error("Error al simular:", error);
      setError("Error al realizar la simulación. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="max-w-[1700px] mx-auto px-6 py-4">
        {view === "tsa" && (
          <>
            {/* Header de la sección */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Simulador de Créditos Hipotecarios
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Calcula tus cuotas, analiza diferentes escenarios y toma la mejor decisión 
                para tu crédito hipotecario con nuestras herramientas avanzadas.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="grid lg:grid-cols-6 gap-4">
              {/* Formulario */}
              <div className="lg:col-span-2">
                <CreditForm onSimulate={simulateCredit} loading={loading} />
              </div>

              {/* Resultados */}
              <div className="lg:col-span-4">   
                {loading ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Calculando simulación...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    <Results data={result} />
                    <AmortizationTable tabla={result?.tabla_amortizacion} />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <ChartIcon width={28} height={28} fill="#1D4ED8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Configura tu simulación
                    </h3>
                    <p className="text-gray-600">
                      Completa el formulario de la izquierda para ver los resultados de tu simulación de crédito.
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