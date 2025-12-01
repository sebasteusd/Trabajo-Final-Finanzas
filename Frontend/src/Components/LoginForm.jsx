import { useState } from "react";

// 🔥 URL DINÁMICA: Si existe la variable de entorno (Nube), la usa. Si no, usa localhost.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function LoginForm({ onLogin, onSwitchToRecovery }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const body = new URLSearchParams();
      body.append("username", form.username);
      body.append("password", form.password);

      // 🔥 USAMOS LA VARIABLE AQUÍ
      const res = await fetch(`${API_URL}/api/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
          Iniciar Sesión
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Accede al sistema profesional de análisis de bonos
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario:
              </label>
              <input
                name="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña:
              </label>
              <input
                name="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center text-sm">
          <button
            type="button" // CLAVE: para que no envíe el formulario de login
            onClick={onSwitchToRecovery} // Llama a la función del padre
            className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition duration-200 transform hover:scale-105"
            >
              INICIAR SESIÓN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}