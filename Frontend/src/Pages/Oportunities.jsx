import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
// 🔥 URL DINÁMICA
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// --- Iconos SVG ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const WhatsAppIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']; 

export default function Oportunities({ token }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("TODOS"); 
  
  // --- Estados del Modal ---
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/crm/leads`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // --- ANALYTICS ---
  const analytics = useMemo(() => {
    if (!leads.length) return { distritos: [], probabilidad: [] };

    const distMap = {};
    leads.forEach(l => {
        let d = "Sin definir";
        if (l.direccion) {
            const parts = l.direccion.split('-'); 
            d = parts[0].trim(); 
        }
        distMap[d] = (distMap[d] || 0) + 1;
    });
    
    const distritosData = Object.keys(distMap)
        .map(key => ({ name: key, value: distMap[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const probMap = { "MUY ALTA": 0, "ALTA": 0, "MEDIA": 0, "BAJA": 0 };
    leads.forEach(l => {
        if (probMap[l.probabilidad] !== undefined) probMap[l.probabilidad]++;
    });
    const probabilidadData = Object.keys(probMap).map(key => ({ name: key, value: probMap[key] }));

    return { distritos: distritosData, probabilidad: probabilidadData };
  }, [leads]);

  // --- FILTROS ---
  const filteredLeads = leads.filter(l => {
      if (filterType === "ALTA") return l.probabilidad === "MUY ALTA" || l.probabilidad === "ALTA";
      if (filterType === "TECHO_PROPIO") return l.ingresos <= 3715; 
      return true;
  });

  // --- KPI DATA ---
  const totalLeads = leads.length;
  const eligibleBonoCount = leads.filter(l => l.ingresos <= 3715).length;
  const highProbCount = leads.filter(l => l.probabilidad === "MUY ALTA" || l.probabilidad === "ALTA").length;
  // Cálculo de Cartera Potencial (30% de ingresos)
  const carteraPotencial = leads.reduce((acc, l) => acc + l.ingresos, 0) * 0.3;

  return (
    <div className="p-6 bg-[#F3F4F6] min-h-screen font-['Poppins'] animate-fade-in relative">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel CRM de Clientes</h1>
            <p className="text-gray-500 mt-1">Gestión inteligente de cartera y evaluación crediticia</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Actualizar
             </button>
          </div>
        </div>

        {/* 1. KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KpiCard 
                title="Total Clientes" 
                value={totalLeads} 
                icon={<UsersIcon />} 
                color="blue" 
                trend="+5% vs mes ant."
            />
            <KpiCard 
                title="Cartera Potencial" 
                value={`S/ ${carteraPotencial.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`} 
                subtext="(Capacidad pago est.)"
                icon={<ChartIcon />} 
                color="green" 
            />
            <KpiCard 
                title="Clientes Premium" 
                value={highProbCount} 
                subtext="Score > 65 pts"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} 
                color="purple" 
            />
            <KpiCard 
                title="Aptos Bono BFH" 
                value={eligibleBonoCount} 
                subtext="Techo Propio"
                icon={<CheckBadgeIcon />} 
                color="orange" 
            />
        </div>

        {/* 2. GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">📍 Concentración por Distrito</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.distritos} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: 8}} />
                            <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">🎯 Calidad de Clientes (Score)</h3>
                <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={analytics.probabilidad}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {analytics.probabilidad.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 3. TABLA DE GESTIÓN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex gap-3 overflow-x-auto">
                <FilterButton label="Todos los Clientes" active={filterType === "TODOS"} onClick={() => setFilterType("TODOS")} />
                <FilterButton label="🔥 Alta Probabilidad" active={filterType === "ALTA"} onClick={() => setFilterType("ALTA")} />
                <FilterButton label="🏠 Aptos Bono BFH" active={filterType === "TECHO_PROPIO"} onClick={() => setFilterType("TECHO_PROPIO")} />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Ubicación / Contacto</th>
                            <th className="px-6 py-4">Ingresos</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4 text-center">Probabilidad</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-12 text-gray-400">Analizando base de datos...</td></tr>
                        ) : filteredLeads.map((lead) => (
                            <tr key={lead.id_cliente} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{lead.nombre_completo}</div>
                                    <div className="text-xs text-gray-400">{lead.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-700 font-medium">{lead.direccion?.split('-')[0] || "Sin Distrito"}</div>
                                    <div className="text-xs text-gray-400">{lead.telefono}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-700">
                                    S/ {lead.ingresos.toLocaleString()}
                                    {lead.ingresos <= 3715 && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                                            BFH
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-gray-700">{lead.score}</span>
                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${lead.score > 70 ? 'bg-green-500' : lead.score > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                                                style={{ width: `${lead.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getProbabilityColor(lead.probabilidad)}`}>
                                        {lead.probabilidad}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 uppercase tracking-wide">
                                        {lead.estado_seguimiento}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={() => handleOpenModal(lead)}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                        Gestionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- MODAL DE GESTIÓN DE CLIENTE --- */}
        {isModalOpen && selectedClient && (
            <ClientDetailModal 
                client={selectedClient} 
                onClose={handleCloseModal}
                token={token}           
                onUpdate={fetchLeads}   // Recargamos la tabla al guardar cambios
            />
        )}

      </div>
    </div>
  );
}

// --- COMPONENTE DEL MODAL (Ficha Cliente) ---
const ClientDetailModal = ({ client, onClose, token, onUpdate }) => {
    
    // Estados para la nota
    const [note, setNote] = useState(client.notas || "");
    const [saving, setSaving] = useState(false);

    // 🔥 WHATSAPP
    const handleWhatsAppClick = () => {
        if (!client.telefono) {
            alert("Este cliente no tiene número registrado.");
            return;
        }
        const cleanNumber = client.telefono.replace(/\D/g, ''); 
        const finalNumber = cleanNumber.startsWith('51') ? cleanNumber : `51${cleanNumber}`;
        const message = `Hola ${client.nombre_completo}, le saluda el equipo de CrediFácil. He revisado su perfil y me gustaría presentarle algunas oportunidades de crédito a su medida.`;
        const url = `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // 🔥 GUARDAR NOTA
    const handleSaveNote = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/api/crm/leads/${client.id_cliente}/notes`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ notas: note })
            });

            if (!res.ok) throw new Error("Error al guardar");
            
            // Refrescamos la tabla principal para que se vea el cambio de estado si hubo
            onUpdate(); 
            alert("Nota guardada correctamente");
            
        } catch (error) {
            console.error(error);
            alert("No se pudo guardar la nota");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-sm">
                            {client.nombre_completo.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{client.nombre_completo}</h2>
                            <p className="text-gray-500 text-sm">ID Cliente: {client.id_cliente}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getProbabilityColor(client.probabilidad)}`}>
                                {client.probabilidad} PROBABILIDAD
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body Scrollable */}
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Sección 1: Datos de Contacto */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Datos de Contacto</h3>
                            <div className="flex items-center gap-3 text-gray-700">
                                <MailIcon /> <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <PhoneIcon /> <span>{client.telefono || "No registrado"}</span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-700">
                                <MapIcon /> <span className="text-sm">{client.direccion || "Sin dirección"}</span>
                            </div>
                        </div>

                        {/* Sección 2: Perfil Financiero */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Perfil Financiero</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Ingresos Mensuales</span>
                                    <span className="font-bold text-gray-800">S/ {client.ingresos.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Score Interno</span>
                                    <span className="font-bold text-blue-600">{client.score}/100</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Apto Bono BFH</span>
                                    {client.ingresos <= 3715 ? (
                                        <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckBadgeIcon /> SÍ APLICA</span>
                                    ) : (
                                        <span className="text-gray-400 text-xs font-bold">NO APLICA</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Notas y Seguimiento Interactiva */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bitácora de Seguimiento</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border uppercase">
                                Estado: {client.estado_seguimiento}
                            </span>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all resize-none"
                                rows="3"
                                placeholder="Escribe aquí las notas del seguimiento (ej: Llamada realizada, interesado en depa de Lince...)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleSaveNote}
                                disabled={saving}
                                className={`absolute bottom-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1
                                    ${saving 
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                        : "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                                    }`}
                            >
                                {saving ? "Guardando..." : "💾 Guardar Nota"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                        Cerrar
                    </button>
                    <button 
                        onClick={handleWhatsAppClick} 
                        className="px-4 py-2 bg-[#25D366] text-white font-medium rounded-lg hover:bg-[#128C7E] shadow-lg shadow-green-200 transition-colors flex items-center gap-2"
                    >
                        <WhatsAppIcon />
                        Contactar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- HELPERS VISUALES ---
const getProbabilityColor = (prob) => {
    switch (prob) {
        case "MUY ALTA": return "bg-green-100 text-green-700 border-green-200";
        case "ALTA": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "MEDIA": return "bg-yellow-50 text-yellow-700 border-yellow-200";
        default: return "bg-red-50 text-red-600 border-red-100";
    }
};

const KpiCard = ({ title, value, subtext, icon, color, trend }) => {
    const bgColors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgColors[color]}`}>
                    {icon}
                </div>
                {trend && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1 font-medium">{subtext}</p>}
            </div>
        </div>
    );
};

const FilterButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border
            ${active 
                ? "bg-gray-800 text-white border-gray-800 shadow-lg shadow-gray-200" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
    >
        {label}
    </button>
);