import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

// --- PÁGINAS ---
import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";
import MisSimulaciones from "./Pages/MisSimulaciones"; 
import Navbar from "./Components/Navbar";
import Oportunities from "./Pages/Oportunities"; 
import Favoritos from "./Pages/Favoritos"; 
import MiPerfil from "./Pages/MiPerfil"; 
import Ayuda from "./Pages/Ayuda";

// --- COMPONENTES GLOBALES ---
import ProtectedRoute from "./Components/ProtectedRoute"; 
import Footer from "./Components/Footer"; 
import ChatbotWidget from "./Components/ChatbotWidget"; 

// 🔥 URL DINÁMICA (Vital para Producción en Render)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("tsa"); 

  const navigate = useNavigate();
  const location = useLocation();
  const LS_TOKEN = "tf_token";

  // --- 1. RESTAURAR TOKEN ---
  useEffect(() => {
    const storedToken = localStorage.getItem(LS_TOKEN);
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    navigate("/"); 
  };

  // --- 2. RECARGAR USUARIO (Corregido con API_URL) ---
  const reloadUser = useCallback(async () => {
    if (!token) return;
    try {
      // 🔥 USAMOS LA URL DINÁMICA AQUÍ
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Error al obtener usuario");
      const data = await res.json();
      setUser(data.usuario);
    } catch (err) {
      console.error(err);
      handleLogout(); 
    }
  }, [token]);

  useEffect(() => {
    const initUser = async () => {
        if (token) await reloadUser();
    };
    initUser();
  }, [token, reloadUser]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem(LS_TOKEN, newToken);
    navigate("/welcome");
  };

  const handleViewChange = (newView) => {
    setView(newView);
    switch (newView) {
        case "welcome": navigate("/welcome"); break;
        case "simulations": navigate("/mis-simulaciones"); break;
        case "users": navigate("/oportunidades"); break;
        case "favorites": navigate("/favoritos"); break;
        case "profile": navigate("/perfil"); break;
        default: navigate("/simulador"); break;
    }
  };

  const handleNavigateToSimulator = () => navigate("/simulador");

  // --- 3. PANTALLA DE CARGA ---
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-semibold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // --- 4. LAYOUT PRINCIPAL (Sticky Footer) ---
  return (
    <div className="min-h-screen flex flex-col font-['Poppins']">
      
      {/* Navbar Privada (Solo si hay usuario logueado) */}
      {user && <Navbar user={user} view={view} onChangeView={handleViewChange} onLogout={handleLogout} />}

      {/* Contenido Flexible */}
      <div className="flex-grow bg-gray-50">
          <Routes>
            
            {/* === RUTA PÚBLICA (LOGIN) === */}
            <Route 
                path="/" 
                element={!token ? <Home onLogin={handleLogin} /> : <Navigate to="/welcome" />} 
            />

            {/* === RUTA PÚBLICA (AYUDA) === */}
            {/* Se le pasa 'user' para que decida qué Navbar mostrar dentro */}
            <Route path="/ayuda" element={<Ayuda user={user} />} />
            
            {/* === RUTAS PROTEGIDAS (Usuarios Logueados) === */}
            <Route element={<ProtectedRoute isAllowed={!!token} />}>
                
                <Route 
                    path="/welcome" 
                    element={<Welcome user={user} token={token} onNavigateToSimulator={handleNavigateToSimulator} />} 
                />

                <Route 
                    path="/simulador" 
                    element={<Simulador user={user} token={token} view="tsa" users={[]} />} 
                />

                <Route 
                    path="/mis-simulaciones" 
                    element={<MisSimulaciones user={user} token={token} onNavigateToSimulator={handleNavigateToSimulator} />} 
                />
                
                <Route 
                    path="/favoritos" 
                    element={<Favoritos user={user} token={token} onNavigateToSimulator={handleNavigateToSimulator} />} 
                />

                <Route 
                    path="/perfil" 
                    element={<MiPerfil user={user} token={token} onProfileUpdate={reloadUser} />} 
                />

            </Route> 

            {/* === RUTA SOLO PARA ADMIN (CRM) === */}
            <Route element={<ProtectedRoute isAllowed={!!token && user?.role === 'admin'} redirectTo="/welcome" />}>
                <Route path="/oportunidades" element={<Oportunities token={token} />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={token ? "/welcome" : "/"} />} />

          </Routes>
      </div>

      {/* Footer Global (Siempre al final) */}
      <Footer />

      {/* Chatbot Global */}
      <ChatbotWidget user={user} />
      
    </div>
  );
}