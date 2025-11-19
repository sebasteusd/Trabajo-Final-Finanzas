import { useState, useEffect } from "react";
import { HomeIcon, ChartIcon } from "../assets/icons";
import SimulacionCard from "../Components/Cards/SimulacionCard"; // Asegúrate que la ruta sea correcta

export default function MisSimulaciones({ user, token, onNavigateToSimulator }) {
    // Cambiamos el estado para almacenar simulaciones en lugar de propiedades
    const [simulaciones, setSimulaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSimulaciones = async () => {
            try {
                setLoading(true);
                // Simulamos una petición a la API
                setTimeout(() => {
                    setSimulaciones([
                        {
                            id: "000001",
                            fecha: "07/12/2024",
                            concepto: "Casa",
                            monto: 750000,
                            tipoCredito: "Crédito Mi Vivienda",
                            colorTag: "bg-blue-100 text-blue-800"
                        },
                        {
                            id: "000002",
                            fecha: "08/12/2024",
                            concepto: "Departamento",
                            monto: 320000,
                            tipoCredito: "Crédito Hipotecario BCP",
                            colorTag: "bg-purple-100 text-purple-800"
                        },
                        {
                            id: "000003",
                            fecha: "10/12/2024",
                            concepto: "Terreno",
                            monto: 150000,
                            tipoCredito: "Crédito Personal",
                            colorTag: "bg-green-100 text-green-800"
                        },
                        {
                            id: "000004",
                            fecha: "10/12/2024",
                            concepto: "Terreno",
                            monto: 150000,
                            tipoCredito: "Crédito Personal",
                            colorTag: "bg-green-100 text-green-800"
                        }
                    ]);
                    setLoading(false);
                }, 1000);
                
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        
        fetchSimulaciones();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            

            <div className="container mx-auto px-6 py-8">
                
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        ¡Bienvenido de vuelta, {user.username}!
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Revisa tus simulaciones guardadas o genera una nueva proyección financiera para tu futuro hogar.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Tarjeta Izquierda (Informativa) */}
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
                    
                    {/* Tarjeta Derecha (Acción) */}
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

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Mis Simulaciones Guardadas</h3>
                        
                        <button 
                            onClick={onNavigateToSimulator}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            + Nueva Simulación
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Cargando historial...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">Error: {error}</p>
                        </div>
                    ) : simulaciones.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl text-gray-400"></span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-600 mb-2">No tienes simulaciones guardadas</h4>
                            <p className="text-gray-500 mb-6">Realiza tu primera evaluación crediticia hoy mismo.</p>
                        </div>
                    ) : (
                        // AQUI SE RENDEIZA LA NUEVA CARD
                        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                            {simulaciones.map((simulacion) => (
                                <SimulacionCard
                                    key={simulacion.id}
                                    data={simulacion} // Pasamos toda la data
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}