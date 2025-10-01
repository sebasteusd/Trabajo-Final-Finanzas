import { useState, useEffect } from "react";
import Home from "./Pages/Home";
import Welcome from "./Pages/Welcome";
import Simulador from "./Pages/Simulador";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("tsa"); // "tsa" = simulador, "users" = usuarios
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState("home"); // "home", "welcome", o "simulador"

  // Obtener info del usuario con /me
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:8000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Error al obtener usuario");
          const data = await res.json();
          setUser(data);
          setCurrentPage("welcome"); // Ir a welcome después del login
        } catch (err) {
          console.error(err);
          setToken(null);
          setCurrentPage("home");
        }
      }
    };
    fetchUser();
  }, [token]);

  // Obtener usuarios (solo admin)
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
  };

  const handleNavigateToSimulator = () => {
    setCurrentPage("simulador");
  };

  const handleBackToWelcome = () => {
    setCurrentPage("welcome");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setView("tsa");
    setCurrentPage("home");
  };

  // Renderizar la página actual
  if (!token || currentPage === "home") {
    return <Home onLogin={handleLogin} />;
  }

  if (currentPage === "welcome") {
    return (
      <Welcome
        user={user}
        token={token}
        onNavigateToSimulator={handleNavigateToSimulator}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Simulador 
      user={user}
      token={token}
      onLogout={handleLogout}
      onBackToWelcome={handleBackToWelcome}
      onChangeView={setView}
      view={view}
      users={users}
    />
  );
}
