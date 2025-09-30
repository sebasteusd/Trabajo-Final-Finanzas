import { useState } from "react";

export default function RegisterForm({ onRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al registrar usuario");
      }

      setSuccess("Usuario registrado correctamente. Ya puedes iniciar sesión.");
      setForm({ username: "", password: "" });

      if (onRegister) onRegister();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mt-10"
    >
      <h2 className="text-xl font-semibold text-green-700 mb-4 text-center">
        Registro de Usuario
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
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
        >
          Registrarse
        </button>
      </div>
    </form>
  );
}
