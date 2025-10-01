import { useState } from "react";

export default function RegisterForm({ onRegister }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    dni: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    info_socieconomico: "",
    consentimiento_datos: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar que las contraseñas coincidan
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
          dni: form.dni,
          fecha_nacimiento: form.fecha_nacimiento,
          telefono: form.telefono,
          email: form.email,
          direccion: form.direccion,
          info_socieconomico: form.info_socieconomico,
          consentimiento_datos: form.consentimiento_datos,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al registrar usuario");
      }

      setSuccess("Usuario registrado correctamente. Ya puedes iniciar sesión.");
      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        nombre: "",
        apellido: "",
        dni: "",
        fecha_nacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        info_socieconomico: "",
        consentimiento_datos: false,
      });

      if (onRegister) onRegister();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
          Registro
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Únete al sistema profesional de análisis de bonos
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Fecha de Nacimiento:
              </label>
              <input
                name="fecha_nacimiento"
                type="date"
                placeholder="Ingrese su fecha de nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres:
              </label>
              <input
                name="nombre"
                type="text"
                placeholder="Ingrese sus nombres"
                value={form.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono:
              </label>
              <input
                name="telefono"
                type="text"
                placeholder="Ingrese su teléfono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos:
              </label>
              <input
                name="apellido"
                type="text"
                placeholder="Ingrese sus apellidos"
                value={form.apellido}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico:
              </label>
              <input
                name="email"
                type="email"
                placeholder="Ingrese su correo electrónico"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI:
              </label>
              <input
                name="dni"
                type="text"
                placeholder="Ingrese su DNI"
                value={form.dni}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección:
              </label>
              <input
                name="direccion"
                type="text"
                placeholder="Ingrese su dirección"
                value={form.direccion}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña:
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirme su contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información Socioeconómica:
              </label>
              <input
                name="info_socieconomico"
                type="text"
                placeholder="Ingrese información socioeconómica"
                value={form.info_socieconomico}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 pt-4">
            <input
              type="checkbox"
              name="consentimiento_datos"
              checked={form.consentimiento_datos}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Acepto el tratamiento de mis datos personales
            </span>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition duration-200 transform hover:scale-105"
            >
              REGISTRARSE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}