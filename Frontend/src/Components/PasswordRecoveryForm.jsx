// PasswordRecoveryForm.jsx
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// onClose es la función que te permite volver a la vista de login (switchToLogin)
export default function PasswordRecoveryForm({ onClose }) {
  const [form, setForm] = useState({ 
    usernameOrEmail: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      // 🚨 IMPORTANTE: Este endpoint es hipotético. Debe existir en tu backend
      // y debe permitir el cambio de contraseña con el identificador del usuario.
      const res = await fetch(`${API_URL}/api/auth/reset-password-direct`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: form.usernameOrEmail, 
          new_password: form.newPassword 
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo cambiar la contraseña. Usuario o clave de seguridad inválida.");
      }

      setSuccess(true);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
          Restablecer Contraseña
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Ingrese su usuario y la nueva contraseña.
        </p>

        {success ? (
          <div className="text-center p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p className="font-semibold">¡Contraseña Cambiada! 🎉</p>
            <p className="text-sm">Ahora puedes iniciar sesión con tu nueva clave.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Usuario/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario o Email:
              </label>
              <input
                name="usernameOrEmail"
                type="text"
                placeholder="Su usuario o email"
                value={form.usernameOrEmail}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Campo Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña:
              </label>
              <input
                name="newPassword"
                type="password"
                placeholder="Cree su nueva contraseña"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña:
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repita la nueva contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Cambiando Contraseña..." : "Restablecer Contraseña"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Volver al Inicio de Sesión
            </button>
        </div>

      </div>
    </div>
  );
}