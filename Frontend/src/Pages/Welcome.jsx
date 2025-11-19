import { useState, useEffect } from "react";
import { HomeIcon, ChartIcon } from "../assets/icons";
import PropertyCard from "../Components/Cards/PropiedadCard.jsx"; 

export default function Welcome({ user, token, onNavigateToSimulator }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                setTimeout(() => {
                    setProperties([
                        {
                            id: 1,
                            address: "Av. Principal 123, San José",
                            type: "Casa",
                            price: 150000000,
                            area: 120,
                            bedrooms: 3,
                            bathrooms: 2,
                            description: "Hermosa casa en zona residencial con jardín"
                        },
                        {
                            id: 2,
                            address: "Calle 5, Cartago",
                            type: "Apartamento", 
                            price: 85000000,
                            area: 80,
                            bedrooms: 2,
                            bathrooms: 1,
                            description: "Moderno apartamento cerca del centro"
                        },
                        {
                            id: 3,
                            address: "Avenida Central, Heredia",
                            type: "Condominio",
                            price: 200000000,
                            area: 150,
                            bedrooms: 4,
                            bathrooms: 3,
                            description: "Exclusivo condominio con amenidades"
                        },
                        {
                            id: 4,
                            address: "Avenida Central, Heredia",
                            type: "Condominio",
                            price: 200000000,
                            area: 150,
                            bedrooms: 4,
                            bathrooms: 3,
                            description: "Exclusivo condominio con amenidades"
                        }
                    ]);
                    setLoading(false);
                }, 1000);
                
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        
        fetchProperties();
    }, [token]);


    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-6 py-8">
                
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        ¡Bienvenido de vuelta, {user.username}!
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Aquí puedes ver todos tus inmuebles registrados y acceder al simulador de créditos 
                        para analizar diferentes opciones de financiamiento.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <HomeIcon width={28} height={28} fill="#1D4ED8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Mis Propiedades</h3>
                                <p className="text-gray-600">Gestiona y visualiza tus inmuebles</p>
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
                                <h3 className="text-xl font-semibold">Simulador de Créditos</h3>
                                <p className="opacity-90">Calcula y analiza opciones de financiamiento</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Mis Inmuebles</h3>
                        
                        {user?.role === "admin" && (
                            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                + Agregar Propiedad
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Cargando propiedades...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">Error: {error}</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl text-gray-400">🏠</span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-600 mb-2">No tienes propiedades registradas</h4>
                            <p className="text-gray-500 mb-6">Comienza agregando tu primera propiedad para poder simular créditos</p>
                            
                            {user?.role === "admin" && (
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                    Agregar Primera Propiedad
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    formatPrice={formatPrice}
                                    onNavigateToSimulator={onNavigateToSimulator}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}