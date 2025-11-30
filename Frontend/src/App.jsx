import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

// ... tus imports existentes ...
import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";
import MisSimulaciones from "./Pages/MisSimulaciones"; 
import Navbar from "./Components/Navbar";
import Oportunities from "./Pages/Oportunities"; 
import Favoritos from "./Pages/Favoritos"; 
import MiPerfil from "./Pages/MiPerfil"; 

// 1. IMPORTAR EL COMPONENTE PROTECTED ROUTE
import ProtectedRoute from "./Components/ProtectedRoute"; 

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
    // ... tu switch de navegación ...
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

  // --- 2. PANTALLA DE CARGA (Solo cuando hay token pero no user) ---
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

  // --- 3. RENDERIZADO CON RUTAS PROTEGIDAS ---
  return (
    <>
      {/* Navbar solo si hay usuario logueado */}
      {user && <Navbar user={user} view={view} onChangeView={handleViewChange} onLogout={handleLogout} />}

      <Routes>
        
        {/* === RUTA PÚBLICA (LOGIN) === */}
        {/* Si ya tiene token y trata de ir al Home, lo mandamos a Welcome */}
        <Route 
            path="/" 
            element={!token ? <Home onLogin={handleLogin} /> : <Navigate to="/welcome" />} 
        />

        {/* === RUTAS PROTEGIDAS (Requieren Token) === */}
        {/* Todo lo que esté aquí dentro requiere isAllowed={!!token} */}
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

        </Route> {/* Fin de Rutas Protegidas */}


        {/* === BONUS: RUTA SOLO PARA ADMIN === */}
        {/* Si quisiera una ruta que solo el admin pueda ver, se haría así: */}
        <Route element={<ProtectedRoute isAllowed={!!token && user?.role === 'admin'} redirectTo="/welcome" />}>
             {/* <Route path="/panel-admin" element={<AdminDashboard />} /> */}
             {/*  LA PONEMOS AQUÍ: Ahora solo el admin puede entrar */}
             <Route path="/oportunidades" element={<Oportunities token={token} />} />

        </Route>

        {/* Catch-all: Cualquier ruta desconocida */}
        <Route path="*" element={<Navigate to={token ? "/welcome" : "/"} />} />

      </Routes>
    </>
  );
}