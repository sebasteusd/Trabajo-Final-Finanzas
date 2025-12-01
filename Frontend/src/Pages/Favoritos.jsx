import { useState, useEffect, useRef } from "react";
import { HomeIcon, ChartIcon } from "../assets/icons"; // Ajusta ruta si es necesario
import PropertyCard from "../Components/Cards/PropiedadCard.jsx"; 
import PropertyDetailsModal from "../Components/PropertyDetailsModal.jsx"; // O la ruta donde lo tengas

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Favoritos({ user, token, onNavigateToSimulator }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Filtros (Igual que en Welcome)
    const [searchTerm, setSearchTerm] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});
    
    // Estado para Modal de Detalles
    const [selectedProperty, setSelectedProperty] = useState(null);

    const dropdownRef = useRef(null);
    const filterOptions = ["Precio", "Lugar", "Area", "Estado", "Tipo"]; 

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true);
                // CAMBIO CLAVE: Llamamos al endpoint de favoritos, no al de todas las propiedades
                const res = await fetch(`${API_URL}/api/favorites/`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Error al cargar favoritos");
                const data = await res.json();

                const mappedProperties = data.map(prop => ({
                    id: prop.id_unidad,
                    address: `${prop.direccion}, ${prop.lugar}`,
                    city: prop.lugar, 
                    type: prop.tipo_unidad,
                    price: prop.precio_venta,
                    area: prop.area_m2,
                    bedrooms: prop.habitaciones,
                    bathrooms: prop.banos,
                    description: prop.descripcion,
                    status: prop.estado || "Disponible", 
                    image: prop.fotos && prop.fotos.length > 0 ? prop.fotos[0].url_foto : null
                }));

                setProperties(mappedProperties);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };
        
        if (token) fetchFavorites();
    }, [token]);

    // Cerrar menús al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency', currency: 'PEN', minimumFractionDigits: 0
        }).format(price);
    };

    // --- LÓGICA DE FILTROS (Copia exacta de Welcome) ---
    const getOptionsForFilter = (filterName) => {
        switch (filterName) {
            case "Tipo": return [...new Set(properties.map(p => p.type))];
            case "Lugar": return [...new Set(properties.map(p => p.city))];
            case "Estado": return [...new Set(properties.map(p => p.status))];
            case "Precio": return ["Menor a Mayor", "Mayor a Menor"];
            case "Area": return ["Menor a Mayor", "Mayor a Menor"];
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

    const filteredProperties = properties.filter((prop) => {
        const matchesSearch = searchTerm === "" || 
            prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prop.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedFilters["Tipo"] || prop.type === selectedFilters["Tipo"];
        const matchesPlace = !selectedFilters["Lugar"] || prop.city === selectedFilters["Lugar"];
        const matchesStatus = !selectedFilters["Estado"] || prop.status === selectedFilters["Estado"];
        return matchesSearch && matchesType && matchesPlace && matchesStatus;
    }).sort((a, b) => {
        if (selectedFilters["Precio"] === "Menor a Mayor") return a.price - b.price;
        if (selectedFilters["Precio"] === "Mayor a Menor") return b.price - a.price;
        if (selectedFilters["Area"] === "Menor a Mayor") return a.area - b.area;
        if (selectedFilters["Area"] === "Mayor a Menor") return b.area - a.area;
        return 0;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['Poppins']">
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-8">
                
                {/* Header igual a Welcome */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">❤️ Mis Favoritos</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Aquí encontrarás todas las propiedades que has guardado.
                    </p>
                </div>

                {/* Accesos Directos (Para mantener consistencia) */}
                <div className="grid md:grid-cols-2 gap-6 mb-12 w-full">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full"><HomeIcon width={28} height={28} fill="#1D4ED8" /></div>
                            <div><h3 className="text-xl font-semibold text-gray-800">Volver al Inicio</h3><p className="text-gray-600">Explora más propiedades disponibles</p></div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow" onClick={onNavigateToSimulator}>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 p-3 rounded-full"><ChartIcon width={28} height={28} stroke="#ffffffff" /></div>
                            <div><h3 className="text-xl font-semibold">Simulador de Créditos</h3><p className="opacity-90">Calcula financiamiento para tus favoritos</p></div>
                        </div>
                    </div>
                </div>

                {/* --- CONTENEDOR BLANCO PRINCIPAL --- */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 min-h-[600px]">
                    
                    {/* Título de la sección */}
                    <div className="flex justify-between items-center mb-6 w-full max-w-[1570px] mx-auto">
                        <h3 className="text-2xl font-bold text-[#1F2937]">Tu lista de deseos</h3>
                        {/* No mostramos botón de agregar propiedad aquí */}
                    </div>

                    {/* --- FILTROS (Exactamente igual que Welcome) --- */}
                    <div className="mb-10 space-y-6 flex flex-col items-start w-full max-w-[1570px] mx-auto" ref={dropdownRef}>
                        
                        {/* Barra de Búsqueda */}
                        <div className="relative w-full md:w-[600px]">
                            <input 
                                type="text" 
                                placeholder="Filtrar en mis favoritos..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#E5E7EB] text-gray-700 rounded-full py-3 pl-6 pr-12 outline-none focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-500"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* Dropdowns */}
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
                                                {getOptionsForFilter(filter).length === 0 && (
                                                    <div className="px-4 py-2 text-xs text-gray-400">Sin opciones</div>
                                                )}
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
                            <p className="text-gray-600 mt-4">Cargando tus favoritos...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8"><p className="text-red-600">Error: {error}</p></div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4"><span className="text-4xl text-gray-400">💔</span></div>
                            <h4 className="text-xl font-semibold text-gray-600 mb-2">No tienes favoritos aún</h4>
                            <p className="text-gray-500">Ve al inicio y dale ❤️ a las propiedades que te gusten.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-16 justify-center">
                            {filteredProperties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    formatPrice={formatPrice}
                                    onNavigateToSimulator={onNavigateToSimulator}
                                    onClickDetails={() => setSelectedProperty(property)}
                                    
                                    // PROPS CLAVE PARA FAVORITOS
                                    token={token}
                                    initialIsFavorite={true} // Aquí SIEMPRE es true porque estamos en la página de favoritos
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalles */}
            <PropertyDetailsModal 
                property={selectedProperty}
                isOpen={!!selectedProperty} 
                onClose={() => setSelectedProperty(null)} 
                onNavigateToSimulator={onNavigateToSimulator}
             />
        </div>
    );
}