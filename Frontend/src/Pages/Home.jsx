import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Importar hook
import LoginRegister from "./LoginRegister";
import { HomeIcon, ChartIcon, BonoIcon, CheckIcon } from "../assets/icons";
import Footer from "../Components/Footer";
import PublicNavbar from "../Components/PublicNavbar"; // Importar componente

export default function Home({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const location = useLocation();

  // --- DETECTAR SI VENIMOS DE 'AYUDA' CON ORDEN DE LOGIN ---
  useEffect(() => {
    if (location.state?.openLogin) {
        setShowAuth(true);
        // Limpiamos el estado para que no se abra al refrescar (opcional pero recomendado)
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleBackToHome = () => {
    setShowAuth(false);
  };

  if (showAuth) {
    return <LoginRegister onLogin={onLogin} onBackToHome={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      
      {/* 1. USAMOS LA MISMA NAVBAR QUE EN AYUDA */}
      <PublicNavbar onLoginClick={() => setShowAuth(true)} />

      {/* Hero Section */}
      <main className="flex-grow">
          <section className="container mx-auto px-6 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold text-gray-800 mb-6">
                Bienvenido a <span className="text-blue-600">CREDIFÁCIL</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                La plataforma más completa para simular y analizar tus créditos hipotecarios. 
                Toma decisiones financieras inteligentes con nuestras herramientas avanzadas.
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Comenzar Ahora
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section className="container mx-auto px-6 py-16">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
              ¿Por qué elegir CREDIFÁCIL?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <ChartIcon width={34} height={34} fill="#afd81dff" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Simulación Avanzada
                </h4>
                <p className="text-gray-600 text-center">
                  Calcula cuotas, intereses y términos de pago con precisión. 
                  Obtén tablas de amortización detalladas y análisis completos.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <BonoIcon width={34} height={34} fill="#000000ff" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Análisis VAN y TIR
                </h4>
                <p className="text-gray-600 text-center">
                  Evalúa la rentabilidad de tus inversiones inmobiliarias con 
                  cálculos de Valor Actual Neto y Tasa Interna de Retorno.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <HomeIcon width={34} height={34} fill="#000000ff" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Gestión de Propiedades
                </h4>
                <p className="text-gray-600 text-center">
                  Administra múltiples propiedades y escenarios de financiamiento. 
                  Compara opciones y toma la mejor decisión.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="bg-white py-16">
            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">
                    Herramientas profesionales al alcance de todos
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full p-1 mt-1">
                        <CheckIcon width={12} height={12} fill="white" />
                        </div>
                        <p className="text-gray-600">
                        <strong>Cálculos precisos:</strong> Utiliza las mejores prácticas financieras
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full p-1 mt-1">
                        <CheckIcon width={12} height={12} fill="white" />
                        </div>
                        <p className="text-gray-600">
                        <strong>Interfaz intuitiva:</strong> Fácil de usar para todos los niveles
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full p-1 mt-1">
                        <CheckIcon width={12} height={12} fill="white" />
                        </div>
                        <p className="text-gray-600">
                        <strong>Resultados instantáneos:</strong> Obtén análisis en tiempo real
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full p-1 mt-1">
                        <CheckIcon width={12} height={12} fill="white" />
                        </div>
                        <p className="text-gray-600">
                        <strong>Seguridad garantizada:</strong> Tus datos están protegidos
                        </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white">
                  <h4 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h4>
                  <p className="mb-6 opacity-90">
                    Únete a miles de usuarios que ya están tomando mejores decisiones financieras.
                  </p>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full"
                  >
                    Crear cuenta gratis
                  </button>
                </div>
              </div>
            </div>
          </section>
      </main>
    </div>
  );
}