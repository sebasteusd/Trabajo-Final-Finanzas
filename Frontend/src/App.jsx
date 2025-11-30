import { useState, useEffect, useCallback } from "react"; // 1. IMPORTAR useCallback
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";
import MisSimulaciones from "./Pages/MisSimulaciones"; 
import Navbar from "./Components/Navbar";
import Oportunities from "./Pages/Oportunities"; 
import Favoritos from "./Pages/Favoritos"; 
import MiPerfil from "./Pages/MiPerfil"; 

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("tsa"); 

  const navigate = useNavigate();
  const location = useLocation();
  const LS_TOKEN = "tf_token";

  // --- 1. RESTAURAR TOKEN AL INICIO ---
  useEffect(() => {
    const storedToken = localStorage.getItem(LS_TOKEN);
    if (storedToken) {
        setToken(storedToken);
    }
  }, []);

  // --- MANEJADOR DE LOGOUT (Lo defino antes para usarlo en reloadUser) ---
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    navigate("/"); 
  };

  // --- 2. FUNCIÓN DE RECARGA DE USUARIO (NUEVO) ---
  // Esta función se la pasaremos a MiPerfil para que la llame al guardar cambios
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

  // --- 3. USAR LA FUNCIÓN EN EL EFECTO INICIAL ---
  useEffect(() => {
    const initUser = async () => {
        if (token) {
           await reloadUser(); // Cargamos el usuario
           // Redirección inicial si estamos en la raíz
           if (location.pathname === "/") {
              navigate("/welcome");
           }
        }
    };
    initUser();
  }, [token, reloadUser]); // Dependencias actualizadas

  // --- MANEJADORES ---
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

  const handleNavigateToSimulator = () => {
    navigate("/simulador");
  };

  // --- RENDERIZADO ---
  if (!token) {
    return <Home onLogin={handleLogin} />;
  }

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

  return (
    <>
      <Navbar user={user} view={view} onChangeView={handleViewChange} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" />} />

        <Route 
            path="/welcome" 
            element={
                <Welcome 
                    user={user} 
                    token={token} 
                    onNavigateToSimulator={handleNavigateToSimulator} 
                />
            } 
        />

        <Route 
            path="/simulador" 
            element={
                <Simulador 
                    user={user} 
                    token={token} 
                    view="tsa" 
                    users={[]} 
                />
            } 
        />

        <Route 
            path="/mis-simulaciones" 
            element={
                <MisSimulaciones 
                    user={user} 
                    token={token} 
                    onNavigateToSimulator={handleNavigateToSimulator} 
                />
            } 
        />

        <Route path="/oportunidades" element={<Oportunities token={token} />} />
        
        <Route 
            path="/favoritos" 
            element={
                <Favoritos 
                    user={user} 
                    token={token} 
                    onNavigateToSimulator={handleNavigateToSimulator} 
                />
            } 
        />

        {/* --- 4. AQUÍ PASAMOS LA PROP 'onProfileUpdate' --- */}
        <Route 
            path="/perfil" 
            element={
                <MiPerfil 
                    user={user} 
                    token={token} 
                    onProfileUpdate={reloadUser} // <--- CLAVE PARA QUE SE ACTUALICE
                />
            } 
        />
        
        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </>
  );
}