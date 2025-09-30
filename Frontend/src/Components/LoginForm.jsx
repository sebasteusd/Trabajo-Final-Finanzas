import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // El backend espera form-data estilo x-www-form-urlencoded
      const body = new URLSearchParams();
      body.append("username", form.username);
      body.append("password", form.password);

      const res = await fetch("http://localhost:8000/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      onLogin(data.access_token); // Guardar el token en el  localStorage
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mt-10"
    >
      <h2 className="text-xl font-semibold text-sky-700 mb-4 text-center">
        Acceso al Simulador
      </h2>

      <div className="space-y-4">
        <input
          name="username"
          type="text"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded transition"
        >
          Iniciar sesión
        </button>
      </div>
    </form>
  );
}
