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
    ingresos_mensuales: "", // CAMBIO: Usamos el nombre correcto
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
          // Convertimos a número/float para el backend
          ingresos_mensuales: parseFloat(form.ingresos_mensuales) || 0, 
          consentimiento_datos: form.consentimiento_datos,
          // Ya no enviamos info_socieconomico, no es necesario
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al registrar usuario");
      }

      setSuccess("Usuario registrado correctamente.");
      // Limpiar formulario
      setForm({
        username: "", password: "", confirmPassword: "", nombre: "", apellido: "",
        dni: "", fecha_nacimiento: "", telefono: "", email: "", direccion: "",
        ingresos_mensuales: "", consentimiento_datos: false,
      });

      if (onRegister) onRegister();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">Registro</h2>
        <p className="text-center text-gray-500 mb-6">Únete al sistema profesional de análisis de bonos</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- DATOS DE CUENTA --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario:</label>
              <input name="username" type="text" placeholder="Ej: juanperez" value={form.username} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico:</label>
               <input name="email" type="email" placeholder="juan@mail.com" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* --- DATOS PERSONALES --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombres:</label>
              <input name="nombre" type="text" placeholder="Tus nombres" value={form.nombre} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos:</label>
              <input name="apellido" type="text" placeholder="Tus apellidos" value={form.apellido} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DNI:</label>
              <input name="dni" type="text" placeholder="8 dígitos" value={form.dni} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono:</label>
              <input name="telefono" type="text" placeholder="Celular" value={form.telefono} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Nacimiento:</label>
              <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección (Distrito):</label>
              <input name="direccion" type="text" placeholder="Ej: Miraflores, Lima" value={form.direccion} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* --- DATOS FINANCIEROS (CRUCIAL PARA CRM) --- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingresos Mensuales (S/.):</label>
              <input
                name="ingresos_mensuales" 
                type="number" 
                min="0"
                step="100"
                placeholder="Ej: 3500"
                value={form.ingresos_mensuales}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-full px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">Este dato nos ayuda a calcular tu capacidad de crédito.</p>
            </div>

            {/* --- SEGURIDAD --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña:</label>
              <input name="password" type="password" placeholder="******" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña:</label>
              <input name="confirmPassword" type="password" placeholder="******" value={form.confirmPassword} onChange={handleChange} required className="w-full border border-gray-300 rounded-full px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* CHECKBOX */}
          <div className="flex items-center justify-center space-x-2 pt-4">
            <input type="checkbox" name="consentimiento_datos" checked={form.consentimiento_datos} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">Acepto el tratamiento de datos personales para evaluación crediticia.</span>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-semibold bg-red-50 p-2 rounded">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center font-semibold bg-green-50 p-2 rounded">{success}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition duration-200 transform hover:scale-[1.02] shadow-lg">
            CREAR CUENTA
          </button>
        </form>
      </div>
    </div>
  );
}