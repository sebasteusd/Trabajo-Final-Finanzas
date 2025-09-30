import { useState, useEffect } from "react";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import CreditForm from "./Components/CreditForm";
import Results from "./Components/Results";
import AmortizationTable from "./Components/AmortizacionTable";
import Navbar from "./Components/Navbar";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("tsa"); // "tsa" = simulador, "users" = usuarios
  const [result, setResult] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [users, setUsers] = useState([]);

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
        } catch (err) {
          console.error(err);
          setToken(null);
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

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setView("tsa");
  };

  const simulateCredit = async (payload) => {
    const res = await fetch("http://localhost:8000/api/simulate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white text-gray-800">
      <header className="bg-sky-700 text-white py-6 shadow-md text-center">
        <h1 className="text-3xl font-bold">Simulador MiVivienda</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {!token ? (
          <div className="space-y-4">
            {showLogin ? (
              <LoginForm onLogin={setToken} />
            ) : (
              <RegisterForm onRegister={() => setShowLogin(true)} />
            )}

            <div className="text-center">
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="text-sky-600 hover:underline"
              >
                {showLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navbar */}
            {user && (
              <Navbar
                user={user}
                onLogout={handleLogout}
                onChangeView={setView}
              />
            )}

            <div className="mt-6">
              {view === "tsa" && (
                <>
                  <CreditForm onSimulate={simulateCredit} />
                  <Results data={result} />
                  <AmortizationTable tabla={result?.tabla_amortizacion} />
                </>
              )}

              {view === "users" && user?.role === "admin" && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-sky-700">
                    Lista de usuarios
                  </h2>
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border px-3 py-2">Usuario</th>
                        <th className="border px-3 py-2">Activo</th>
                        <th className="border px-3 py-2">Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={i}>
                          <td className="border px-3 py-2">{u.username}</td>
                          <td className="border px-3 py-2">
                            {u.is_active ? "Sí" : "No"}
                          </td>
                          <td className="border px-3 py-2">{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
