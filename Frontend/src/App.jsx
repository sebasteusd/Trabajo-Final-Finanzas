import { useState, useEffect } from "react";
import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";
import MisSimulaciones from "./Pages/MisSimulaciones"; 
import Navbar from "./Components/Navbar";
import Oportunities from "./Pages/Oportunities"; 
import Favoritos from "./Pages/Favoritos"; 
import MiPerfil from "./Pages/MiPerfil"; // 1. IMPORTAR MI PERFIL

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [view, setView] = useState("tsa"); 
  
  // Estados posibles: 'home', 'welcome', 'simulador', 'simulations', 'users', 'favorites', 'profile'
  const [currentPage, setCurrentPage] = useState("home"); 

  const LS_TOKEN = "tf_token";
  const LS_VIEW = "tf_view";
  const LS_PAGE = "tf_currentPage";

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:8000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Error al obtener usuario");
          const data = await res.json();
          setUser(data.usuario);
          
          const storedPage = localStorage.getItem(LS_PAGE);
          const storedView = localStorage.getItem(LS_VIEW);
          
          if (storedPage && storedPage !== "home") {
             setCurrentPage(storedPage);
             setView(storedView || "welcome");
          } else {
             setCurrentPage("welcome");
             setView("welcome");
          }

          try { localStorage.setItem(LS_TOKEN, token); } catch (err) { console.warn("localStorage set error", err); }
        } catch (err) {
          console.error(err);
          setToken(null);
          setCurrentPage("home");
          try { localStorage.removeItem(LS_TOKEN); } catch (err) { console.warn("localStorage remove error", err); }
        }
      }
    };
    fetchUser();
  }, [token]);

  // Restore token
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LS_TOKEN);
      if (storedToken) setToken(storedToken);
    } catch (err) {
      console.warn("localStorage read error", err);
    }
  }, []);

  // Persist state
  useEffect(() => {
    try { if (view) localStorage.setItem(LS_VIEW, view); } catch (err) { console.warn("localStorage set error", err); }
  }, [view]);

  useEffect(() => {
    try { if (currentPage) localStorage.setItem(LS_PAGE, currentPage); } catch (err) { console.warn("localStorage set error", err); }
  }, [currentPage]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    try { localStorage.setItem(LS_TOKEN, newToken); } catch (err) { console.warn("localStorage set error", err); }
  };

  const handleNavigateToSimulator = () => {
    setCurrentPage("simulador");
    setView("tsa"); 
  };

  // --- LÓGICA DE NAVEGACIÓN ACTUALIZADA ---
  const handleViewChange = (newView) => {
    if (newView === "welcome") {
      setCurrentPage("welcome");
      setView("welcome");
    
    } else if (newView === "simulations") {
      setCurrentPage("simulations");
      setView("simulations");
      
    } else if (newView === "users") { 
      setCurrentPage("users"); 
      setView("users");
      
    } else if (newView === "favorites") { 
      setCurrentPage("favorites");
      setView("favorites");

    } else if (newView === "profile") { 
      // 2. NUEVA LÓGICA PARA PERFIL
      setCurrentPage("profile");
      setView("profile");

    } else {
      // El resto (tsa) sigue yendo al Layout del Simulador
      setCurrentPage("simulador");
      setView(newView);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setView("tsa"); 
    setCurrentPage("home");
    try { localStorage.removeItem(LS_TOKEN); } catch (err) { console.warn("localStorage remove error", err); }
    try { localStorage.removeItem(LS_VIEW); } catch (err) { console.warn("localStorage remove error", err); }
    try { localStorage.removeItem(LS_PAGE); } catch (err) { console.warn("localStorage remove error", err); }
  };

  if (!token || currentPage === "home") {
    return <Home onLogin={handleLogin} />;
  }

  return (
    <>
      <Navbar user={user} view={view} onChangeView={handleViewChange} onLogout={handleLogout} />

      {currentPage === "welcome" && (
        <Welcome
          user={user}
          token={token}
          onNavigateToSimulator={handleNavigateToSimulator}
        />
      )}

      {currentPage === "simulations" && (
        <MisSimulaciones
          user={user}
          token={token}
          onNavigateToSimulator={handleNavigateToSimulator}
        />
      )}

      {currentPage === "users" && (
        <Oportunities token={token} />
      )}

      {currentPage === "favorites" && (
        <Favoritos 
            user={user}
            token={token}
            onNavigateToSimulator={handleNavigateToSimulator}
        />
      )}

      {/* 3. RENDERIZADO DE LA PÁGINA PERFIL */}
      {currentPage === "profile" && (
        <MiPerfil 
            user={user}
            token={token}
        />
      )}

      {currentPage === "simulador" && (
        <Simulador
          user={user}
          token={token}
          onLogout={handleLogout}
          onChangeView={handleViewChange}
          view={view}
          users={[]} 
        />
      )}
    </>
  );
}