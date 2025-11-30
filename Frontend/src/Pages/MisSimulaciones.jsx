import { useState, useEffect, useRef } from "react";
import { HomeIcon, ChartIcon } from "../assets/icons";
import SimulacionCard from "../Components/Cards/SimulacionCard"; 
import SimulacionDetailsModal from "../Components/SimulationDetailsModal";

// Ajusta el puerto si es necesario
const API_URL = "http://localhost:8000"; 

export default function MisSimulaciones({ user, token, onNavigateToSimulator }) {
    const [simulaciones, setSimulaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS PARA MODAL DE DETALLES ---
    const [selectedSimulation, setSelectedSimulation] = useState(null);
    const [isModalDetailsOpen, setIsModalDetailsOpen] = useState(false);

    // --- ESTADOS PARA FILTROS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});
    
    const dropdownRef = useRef(null);
    const filterOptions = ["Concepto", "Tipo Crédito", "Monto", "Fecha"]; 

    // --- 1. CARGAR SIMULACIONES REALES ---
    useEffect(() => {
        const fetchSimulaciones = async () => {
            try {
                setLoading(true);
                
                const res = await fetch(`${API_URL}/api/simulations/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) throw new Error("Error al cargar simulaciones");

                const data = await res.json();

                // --- MAPEO DE DATOS ---
                const mappedData = data.map(sim => ({
                    id: sim.id_simulacion.toString().padStart(6, '0'),
                    realId: sim.id_simulacion,
                    fecha: new Date(sim.fecha_simulacion).toLocaleDateString('es-PE', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    }),
                    concepto: sim.concepto_temporal || "Propiedad",
                    monto: sim.monto_financiado,
                    tipoCredito: sim.nombre_producto_credito,
                    
                    // === DATOS DETALLADOS PARA EL MODAL ===
                    cuotaMensual: sim.cuota_mensual_estimada,
                    plazoAnios: sim.plazo_anios,
                    moneda: sim.moneda,
                    
                    // Datos originales del Snapshot
                    valorInmueble: sim.valor_inmueble,
                    cuotaInicial: sim.cuota_inicial,
                    tasaInteres: sim.tasa_interes_aplicada, // La tasa guardada
                    
                    // Cálculos derivados (opcional, si no se guardaron en BD)
                    totalPagos: sim.plazo_anios * 12,
                    totalEstimado: Number(sim.total_pagado || 0)
                }));

                setSimulaciones(mappedData);
                
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (token) fetchSimulaciones();
    }, [token]);

    // --- HANDLER PARA ABRIR MODAL ---
    const handleViewDetails = (simulation) => {
        setSelectedSimulation(simulation);
        setIsModalDetailsOpen(true);
    };

    // --- HANDLER PARA ELIMINAR ---
    const handleDelete = async (realId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta simulación?")) return;

        try {
            const res = await fetch(`${API_URL}/api/simulations/${realId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al eliminar");
            setSimulaciones(prev => prev.filter(s => s.realId !== realId));

        } catch (error) {
            alert("No se pudo eliminar: " + error.message);
        }
    };

    // --- CERRAR DROPDOWN AL CLICKEAR FUERA ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- LÓGICA FILTROS ---
    const getOptionsForFilter = (filterName) => {
        switch (filterName) {
            case "Concepto": return [...new Set(simulaciones.map(s => s.concepto))];
            case "Tipo Crédito": return [...new Set(simulaciones.map(s => s.tipoCredito))];
            case "Monto": return ["Menor a Mayor", "Mayor a Menor"];
            case "Fecha": return ["Más Recientes", "Más Antiguas"];
            default: return [];
        }
    };

    const handleOptionSelect = (filterName, option) => {
        if (selectedFilters[filterName] === option) {
            const newFilters = { ...selectedFilters };
            delete newFilters[filterName];
            setSelectedFilters(newFilters);
        } else {
            setSelectedFilters({ ...selectedFilters, [filterName]: option });
        }
        setActiveDropdown(null);
    };

    const filteredSimulaciones = simulaciones.filter((sim) => {
        const matchesSearch = searchTerm === "" || 
            sim.id.includes(searchTerm) ||
            sim.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sim.tipoCredito.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesConcepto = !selectedFilters["Concepto"] || sim.concepto === selectedFilters["Concepto"];
        const matchesTipo = !selectedFilters["Tipo Crédito"] || sim.tipoCredito === selectedFilters["Tipo Crédito"];

        return matchesSearch && matchesConcepto && matchesTipo;
    }).sort((a, b) => {
        if (selectedFilters["Monto"] === "Menor a Mayor") return a.monto - b.monto;
        if (selectedFilters["Monto"] === "Mayor a Menor") return b.monto - a.monto;
        
        const parseDate = (str) => {
            const [d, m, y] = str.split('/');
            return new Date(`${y}-${m}-${d}`);
        };
        const dateA = parseDate(a.fecha);
        const dateB = parseDate(b.fecha);

        if (selectedFilters["Fecha"] === "Más Antiguas") return dateA - dateB;
        return dateB - dateA; 
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['Poppins']">
            
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-8">
                
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-8">
                        Mis Simulaciones
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Revisa tus simulaciones guardadas o genera una nueva proyección financiera.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12 w-full">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <HomeIcon width={28} height={28} fill="#1D4ED8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Mis Simulaciones</h3>
                                <p className="text-gray-600">Historial de evaluaciones crediticias</p>
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={onNavigateToSimulator}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 p-3 rounded-full">
                                <ChartIcon width={28} height={28} stroke="#ffffffff" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Nueva Simulación</h3>
                                <p className="opacity-90">Calcula cuotas y tasas de interés ahora</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 min-h-[600px]">
                    
                    <div className="flex justify-between items-center mb-6 w-full max-w-[1570px] mx-auto">
                        <h3 className="text-2xl font-bold text-[#1F2937]">Mis Simulaciones Guardadas</h3>
                        
                        <button 
                            onClick={onNavigateToSimulator}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            + Nueva Simulación
                        </button>
                    </div>

                    {/* --- SECCIÓN BÚSQUEDA Y FILTROS --- */}
                    <div className="mb-10 space-y-6 flex flex-col items-start w-full max-w-[1570px] mx-auto" ref={dropdownRef}>
                        
                        <div className="relative w-full md:w-[600px]">
                            <input 
                                type="text" 
                                placeholder="Buscar por concepto, tipo de crédito o ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#E5E7EB] text-gray-700 rounded-full py-3 pl-6 pr-12 outline-none focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-500"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-start w-full relative">
                            {filterOptions.map((filter) => {
                                const isSelected = selectedFilters[filter];
                                const isOpen = activeDropdown === filter;

                                return (
                                    <div key={filter} className="relative">
                                        <button 
                                            onClick={() => setActiveDropdown(isOpen ? null : filter)}
                                            className={`flex items-center justify-between gap-8 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors border 
                                                ${isSelected || isOpen ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-[#E5E7EB] text-[#374151] border-transparent hover:bg-gray-300'}`}
                                        >
                                            <span>{isSelected ? `${filter}: ${isSelected}` : `${filter}:`}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                                                {getOptionsForFilter(filter).map((option) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => handleOptionSelect(filter, option)}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors 
                                                            ${selectedFilters[filter] === option ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600'}`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {(Object.keys(selectedFilters).length > 0 || searchTerm) && (
                                <button 
                                    onClick={() => { setSelectedFilters({}); setSearchTerm(""); }}
                                    className="text-sm text-red-500 hover:text-red-700 underline font-medium self-center ml-2"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Renderizado de Cards */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Cargando historial...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">Error: {error}</p>
                        </div>
                    ) : filteredSimulaciones.length === 0 ? (
                        <div className="text-center py-12">
                             <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🔍</span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron resultados</h4>
                            <p className="text-gray-500 mb-6">Intenta ajustar tus filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-8 justify-center">
                            {filteredSimulaciones.map((sim) => (
                                <SimulacionCard
                                    key={sim.realId} // Usamos ID real para la key de React
                                    id={sim.id}      // Usamos el ID formateado para mostrar
                                    fecha={sim.fecha}
                                    monto={sim.monto}
                                    tipoCredito={sim.tipoCredito}
                                    categoria={sim.concepto}
                                    onDelete={() => handleDelete(sim.realId)}
                                    // AHORA SÍ: Conectamos la acción al handler del modal
                                    onViewDetails={() => handleViewDetails(sim)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- RENDERIZAMOS EL MODAL AQUÍ --- */}
            <SimulacionDetailsModal 
                isOpen={isModalDetailsOpen}
                onClose={() => setIsModalDetailsOpen(false)}
                simulation={selectedSimulation}
            />
        </div>
    );
}