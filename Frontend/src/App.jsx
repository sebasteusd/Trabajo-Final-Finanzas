import { useState, useEffect } from "react";
import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";
import MisSimulaciones from "./Pages/MisSimulaciones"; // <--- IMPORTACIÓN NUEVA
import Navbar from "./Components/Navbar";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [view, setView] = useState("tsa"); 
  const [users, setUsers] = useState([]);

  // Estados posibles: 'home', 'welcome', 'simulador', 'simulations'
  const [currentPage, setCurrentPage] = useState("home"); 

  // Local storage keys
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
          setCurrentPage("welcome");
          setView("welcome");
          // persist sensible defaults after login
          try { localStorage.setItem(LS_TOKEN, token); } catch (err) { console.warn("localStorage set error", err); }
          try { localStorage.setItem(LS_VIEW, "welcome"); } catch (err) { console.warn("localStorage set error", err); }
          try { localStorage.setItem(LS_PAGE, "welcome"); } catch (err) { console.warn("localStorage set error", err); }
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

  // On mount: restore token/view/page from localStorage if available
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LS_TOKEN);
      const storedView = localStorage.getItem(LS_VIEW);
      const storedPage = localStorage.getItem(LS_PAGE);
      if (storedToken) setToken(storedToken);
      if (storedView) setView(storedView);
      if (storedPage) setCurrentPage(storedPage);
    } catch (err) {
      console.warn("localStorage read error", err);
    }
  }, []);

  // Persist view and currentPage when they change
  useEffect(() => {
    try { if (view) localStorage.setItem(LS_VIEW, view); } catch (err) { console.warn("localStorage set error", err); }
  }, [view]);

  useEffect(() => {
    try { if (currentPage) localStorage.setItem(LS_PAGE, currentPage); } catch (err) { console.warn("localStorage set error", err); }
  }, [currentPage]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === "admin" && view === "users") {
        try {
          const res = await fetch("http://localhost:8000/api/auth/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Error al obtener usuarios");
          const data = await res.json();
          setUsers(data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchUsers();
  }, [user, view, token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    try { localStorage.setItem(LS_TOKEN, newToken); } catch (err) { console.warn("localStorage set error", err); }
  };

  const handleNavigateToSimulator = () => {
    setCurrentPage("simulador");
    setView("tsa"); 
  };

  // --- LÓGICA ACTUALIZADA PARA NAVEGACIÓN ---
  const handleViewChange = (newView) => {
    if (newView === "welcome") {
      setCurrentPage("welcome");
      setView("welcome");
    } else if (newView === "simulations") {
      // Nueva condición para ir al historial (acepta ambas keys)
      setCurrentPage("simulations");
      setView("simulations");
    } else {
      // Cualquier otra vista se asume que es interna del Simulador
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

  // ------------------------------------
  // Renderizado Condicional
  // ------------------------------------

  // 1. Home / Login
  if (!token || currentPage === "home") {
    return <Home onLogin={handleLogin} />;
  }
  // After login: show a single Navbar in App and render pages below it
  return (
    <>
      <Navbar user={user} view={view} onChangeView={handleViewChange} onLogout={handleLogout} />

      {/* 2. Welcome Page */}
      {currentPage === "welcome" && (
        <Welcome
          user={user}
          token={token}
          onNavigateToSimulator={handleNavigateToSimulator}
        />
      )}

      {/* 3. Mis Simulaciones */}
      {currentPage === "simulations" && (
        <MisSimulaciones
          user={user}
          token={token}
          onNavigateToSimulator={handleNavigateToSimulator}
        />
      )}

      {/* 4. Simulador Page */}
      {currentPage === "simulador" && (
        <Simulador
          user={user}
          token={token}
          onLogout={handleLogout}
          onChangeView={handleViewChange}
          view={view}
          users={users}
        />
      )}
    </>
  );
}