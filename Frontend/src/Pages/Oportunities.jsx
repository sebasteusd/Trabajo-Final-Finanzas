import React, { useEffect, useState } from 'react';

export default function Oportunities({ token }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // Filtro por estado

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/crm/leads";
      if (filter) url += `?filtro_estado=${filter}`;

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}` // Usamos el token del admin logueado
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        console.error("Error al obtener leads:", res.status);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para el color del badge según probabilidad
  const getBadgeColor = (prob) => {
    switch (prob) {
      case "ALTA": return "bg-green-100 text-green-800 border-green-200";
      case "MEDIA": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tablero de Oportunidades</h1>
            <p className="text-gray-500 mt-1">Identifica y gestiona tus clientes potenciales con IA</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter("")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}
            >
              Todos
            </button>
            <button 
               onClick={() => setFilter("NUEVO")}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "NUEVO" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}
            >
              Nuevos
            </button>
          </div>
        </div>

        {/* Tabla de Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Cliente / Contacto</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Ingresos (PEN)</th>
                  <th className="px-6 py-4 text-center">Score Crediticio</th>
                  <th className="px-6 py-4 text-center">Probabilidad</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-12 text-gray-500">Cargando análisis...</td></tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id_cliente} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{lead.nombre_completo}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-xs text-gray-400">{lead.telefono}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.direccion || "No especificada"}
                    </td>

                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-700">
                      S/ {parseFloat(lead.ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[80px]">
                          <div 
                            className={`h-2.5 rounded-full ${
                              lead.score >= 70 ? 'bg-green-500' : 
                              lead.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                            }`} 
                            style={{ width: `${lead.score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">{lead.score} / 100</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(lead.probabilidad)}`}>
                        {lead.probabilidad}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border uppercase tracking-wide">
                        {lead.estado_seguimiento}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline">
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && leads.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <p>No se encontraron clientes que coincidan con los filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}