import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";
import MisSimulaciones from "./Pages/MisSimulaciones"; 
import Navbar from "./Components/Navbar";
import Oportunities from "./Pages/Oportunities"; 
import Favoritos from "./Pages/Favoritos"; 
import MiPerfil from "./Pages/MiPerfil"; 
import Ayuda from "./Pages/Ayuda";

import ProtectedRoute from "./Components/ProtectedRoute"; 

// 1. IMPORTAR EL FOOTER GLOBAL
import Footer from "./Components/Footer"; 

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

  const reloadUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/auth/me", {
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

  // --- 2. PANTALLA DE CARGA ---
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

  // --- 3. RENDERIZADO PRINCIPAL CON LAYOUT FLEX ---
  return (
    // Contenedor principal que ocupa toda la altura
    <div className="min-h-screen flex flex-col font-['Poppins']">
      
      {/* Navbar fija en la parte superior (si hay usuario) */}
      {user && <Navbar user={user} view={view} onChangeView={handleViewChange} onLogout={handleLogout} />}

      {/* Contenedor de contenido: Crece para empujar el footer abajo */}
      <div className="flex-grow bg-gray-50">
          <Routes>
            
            {/* === RUTA PÚBLICA (LOGIN) === */}
            <Route 
                path="/" 
                element={!token ? <Home onLogin={handleLogin} /> : <Navigate to="/welcome" />} 
            />

            {/* Nueva Ruta Pública: Centro de Ayuda */}
            <Route path="/ayuda" element={<Ayuda user={user} />} />
            
            {/* === RUTAS PROTEGIDAS (Requieren Token) === */}
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

            {/* === RUTA SOLO PARA ADMIN === */}
            <Route element={<ProtectedRoute isAllowed={!!token && user?.role === 'admin'} redirectTo="/welcome" />}>
                <Route path="/oportunidades" element={<Oportunities token={token} />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={token ? "/welcome" : "/"} />} />

          </Routes>
      </div>

      {/* Footer GLOBAL (Siempre al final) */}
      <Footer />
      
    </div>
  );
}