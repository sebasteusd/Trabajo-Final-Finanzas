import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- LISTA DE DISTRITOS ---
const DISTRITOS_LIMA_CALLAO = [
  "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Cercado de Lima", "Chaclacayo", 
  "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", 
  "La Molina", "La Victoria", "Lima", "Lince", "Los Olivos", "Lurigancho", "Lurín", 
  "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", 
  "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", 
  "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", 
  "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", 
  "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", 
  "Villa María del Triunfo", 
  // Callao
  "Bellavista", "Callao", "Carmen de la Legua", "La Perla", "La Punta", "Mi Perú", "Ventanilla"
].sort();

// --- ICONOS SVG ---
const CheckIcon = () => <span className="text-green-500 mr-2">✔</span>;
const CrossIcon = () => <span className="text-gray-300 mr-2">○</span>;

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

// FUNCIÓN AUXILIAR DE VALIDACIÓN DE EDAD
const isOver18 = (birthDateString) => {
    if (!birthDateString) return false;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 18;
};


// ------------------------------------------
// COMPONENTE MODAL DE ÉXITO
// ------------------------------------------
const SuccessModal = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose} 
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()} 
            >
                <div className="text-center">
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Registro Exitoso! 🎉</h3>
                    <p className="text-gray-600 mb-6">Tu cuenta ha sido creada. Serás redirigido al inicio de sesión.</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                    >
                        Ir a Iniciar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
// ------------------------------------------


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
    distrito: "",
    direccion_exacta: "",
    ingresos_mensuales: "",
    consentimiento_datos: false,
  });

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [captchaValido, setCaptchaValido] = useState(null); 
  const captchaRef = useRef(null); 

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });

  useEffect(() => {
    const pwd = form.password;
    const criteria = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setPasswordCriteria(criteria);
    const score = Object.values(criteria).filter(Boolean).length;
    setPasswordStrength(score * 20); 
  }, [form.password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 20) return "bg-red-500";
    if (passwordStrength <= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 20) return "Muy Débil";
    if (passwordStrength <= 40) return "Débil";
    if (passwordStrength <= 60) return "Media";
    if (passwordStrength <= 80) return "Fuerte";
    return "Muy Segura";
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValido(value); 
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };
  
  // FUNCIÓN PARA MANEJAR DNI (8 dígitos) Y TELÉFONO (9 dígitos)
  const handleNumberChange = (e) => {
      const { name, value } = e.target;
      
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      const maxLength = name === 'dni' ? 8 : 9;

      setForm({ ...form, [name]: onlyNumbers.slice(0, maxLength) });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDACIONES FRONTEND (Longitud y edad)
    const DNI_LENGTH = 8;
    const TEL_LENGTH = 9;

    if (!captchaValido) {
        setError("Por favor completa el CAPTCHA para continuar.");
        return;
    }

    if (passwordStrength < 80) {
        setError("La contraseña no es lo suficientemente segura.");
        return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!isOver18(form.fecha_nacimiento)) {
        setError("Debes ser mayor de 18 años para registrarte.");
        return;
    }
    
    if (form.dni.length !== DNI_LENGTH) {
        setError(`El DNI debe tener exactamente ${DNI_LENGTH} dígitos.`);
        return;
    }
    
    if (form.telefono.length !== TEL_LENGTH) {
        setError(`El Teléfono debe tener exactamente ${TEL_LENGTH} dígitos.`);
        return;
    }
    // ------------------------------------

    try {
      const direccionFinal = `${form.distrito} - ${form.direccion_exacta}`;

      const res = await fetch(`${API_URL}/api/auth/register`, {
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
          direccion: direccionFinal,
          ingresos_mensuales: parseFloat(form.ingresos_mensuales) || 0,
          consentimiento_datos: form.consentimiento_datos,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        // Captura los errores de unicidad del backend (DNI/Email/Teléfono duplicados)
        throw new Error(errData.detail || "Error al registrar usuario");
      }

      // Limpiar formulario y estados de seguridad
      setForm({
        username: "", password: "", confirmPassword: "", nombre: "", apellido: "",
        dni: "", fecha_nacimiento: "", telefono: "", email: "", 
        distrito: "", direccion_exacta: "",
        ingresos_mensuales: "", consentimiento_datos: false,
      });
      setPasswordStrength(0);
      setCaptchaValido(null);
      captchaRef.current.reset();

      // Mostrar el modal de éxito
      setShowModal(true); 

    } catch (err) {
      setError(err.message);
      setCaptchaValido(null);
      if(captchaRef.current) captchaRef.current.reset();
    }
  };

  // Función para cerrar el modal y redirigir
  const handleCloseModal = () => {
    setShowModal(false);
    if (onRegister) onRegister(); // Redirige a la vista de login
  };

  return (
    <div className="flex items-center justify-center p-4 font-['Poppins']">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Registro Seguro</h2>
        <p className="text-center text-gray-500 mb-8">Únete al sistema profesional de análisis de bonos</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DATOS DE CUENTA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario:</label>
              <input name="username" type="text" placeholder="Ej: juanperez" value={form.username} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico:</label>
               <input name="email" type="email" placeholder="juan@mail.com" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            {/* DATOS PERSONALES */}
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Nombres:</label><input name="nombre" type="text" placeholder="Tus nombres" value={form.nombre} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Apellidos:</label><input name="apellido" type="text" placeholder="Tus apellidos" value={form.apellido} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
            
            {/* CAMPO DNI */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DNI (8 dígitos):</label>
                <input 
                    name="dni" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="8 dígitos" 
                    value={form.dni} 
                    onChange={handleNumberChange} 
                    required 
                    maxLength={8}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
            </div>
            
            {/* CAMPO TELÉFONO */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono (9 dígitos):</label>
                <input 
                    name="telefono" 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="9 dígitos" 
                    value={form.telefono} 
                    onChange={handleNumberChange} 
                    required 
                    maxLength={9}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
            </div>

            {/* CAMPO FECHA NACIMIENTO */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Nacimiento:</label>
                <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                {form.fecha_nacimiento && !isOver18(form.fecha_nacimiento) && (
                    <p className="text-xs text-red-500 absolute bottom-[-20px] left-0">Debes ser mayor de 18 años.</p>
                )}
            </div>
            
            {/* --- SECCIÓN DE DIRECCIÓN MEJORADA --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distrito:</label>
              <select 
                  name="distrito" 
                  value={form.distrito} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                  <option value="">Selecciona...</option>
                  {DISTRITOS_LIMA_CALLAO.map(d => (
                      <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="Otro">Otro (Provincia)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección Exacta:</label>
              <input 
                  name="direccion_exacta" 
                  type="text" 
                  placeholder="Av. Javier Prado 123, Urb. Los Ficus" 
                  value={form.direccion_exacta} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            {/* DATOS FINANCIEROS */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingresos Mensuales (S/.):</label>
              <input name="ingresos_mensuales" type="number" min="0" step="100" placeholder="Ej: 3500" value={form.ingresos_mensuales} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700 transition-all"/>
              <p className="text-xs text-gray-500 mt-1 ml-2">Este dato nos ayuda a calcular tu capacidad de crédito.</p>
            </div>

            {/* SECCIÓN SEGURIDAD */}
            <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center">🔒 Seguridad de la Cuenta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
                            <input name="password" type={showPassword ? "text" : "password"} placeholder="******" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none">{showPassword ? <EyeSlashIcon /> : <EyeIcon />}</button>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña:</label>
                            <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="******" value={form.confirmPassword} onChange={handleChange} required className={`w-full border rounded-xl px-4 py-3 pr-10 bg-white focus:ring-2 outline-none transition-all ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none">{showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}</button>
                            {form.confirmPassword && form.password !== form.confirmPassword && (<p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>)}
                        </div>
                    </div>
                    {/* Indicador de Fortaleza */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-700">Fortaleza:</span>
                            <span className={`text-sm font-bold ${passwordStrength <= 40 ? 'text-red-500' : passwordStrength <= 60 ? 'text-yellow-500' : 'text-green-600'}`}>{getStrengthLabel()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
                        </div>
                        <ul className="text-xs space-y-1 text-gray-600">
                            <li className={passwordCriteria.length ? "text-green-600 font-medium" : ""}>{passwordCriteria.length ? <CheckIcon/> : <CrossIcon/>} Mínimo 8 caracteres</li>
                            <li className={passwordCriteria.upper ? "text-green-600 font-medium" : ""}>{passwordCriteria.upper ? <CheckIcon/> : <CrossIcon/>} Al menos una mayúscula</li>
                            <li className={passwordCriteria.lower ? "text-green-600 font-medium" : ""}>{passwordCriteria.lower ? <CheckIcon/> : <CrossIcon/>} Al menos una minúscula</li>
                            <li className={passwordCriteria.number ? "text-green-600 font-medium" : ""}>{passwordCriteria.number ? <CheckIcon/> : <CrossIcon/>} Al menos un número</li>
                            <li className={passwordCriteria.special ? "text-green-600 font-medium" : ""}>{passwordCriteria.special ? <CheckIcon/> : <CrossIcon/>} Un caracter especial (!@#$...)</li>
                        </ul>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 pt-2">
            <input type="checkbox" name="consentimiento_datos" checked={form.consentimiento_datos} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
            <span className="text-sm text-gray-700">Acepto el tratamiento de datos personales para evaluación crediticia.</span>
          </div>

          {/* 4. AQUÍ ESTÁ EL CAPTCHA */}
          <div className="flex justify-center my-4">
               <ReCAPTCHA
                 ref={captchaRef}
                 sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                 onChange={handleCaptchaChange}
               />
          </div>

          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded"><p className="font-bold">Error</p><p>{error}</p></div>}
          
          <button 
            type="submit" 
            disabled={passwordStrength < 80 || !captchaValido || !isOver18(form.fecha_nacimiento) || form.dni.length !== 8 || form.telefono.length !== 9} 
            className={`w-full font-bold py-4 rounded-xl transition duration-200 transform hover:scale-[1.01] shadow-lg text-lg
                ${passwordStrength < 80 || !captchaValido || !isOver18(form.fecha_nacimiento) || form.dni.length !== 8 || form.telefono.length !== 9
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white'
                }`}
          >
            CREAR CUENTA SEGURA
          </button>
        </form>
      </div>

      {/* RENDERIZADO DEL MODAL */}
      <SuccessModal isVisible={showModal} onClose={handleCloseModal} />

    </div>
  );
}