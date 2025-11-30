import React, { useState, useEffect, useRef } from "react";
// Importaciones de iconos (asumiendo que están en la ruta correcta)
import { UserIcon, BriefcaseIcon, CashIcon, ChartIcon } from "../assets/icons"; 

// --- CONSTANTES Y UTILIDADES ---
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
	"Bellavista", "Callao", "Carmen de la Legua", "La Perla", "La Punta", "Mi Perú", "Ventanilla"
].sort();

// --- ICONOS SVG INLINE ---
const SimpleUserIcon = () => (<svg className="text-gray-300 w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>;
const CheckIcon = () => <span className="text-green-500 mr-2">✔</span>;
const CrossIcon = () => <span className="text-gray-300 mr-2">○</span>;

const API_URL = "http://localhost:8000";

export default function MiPerfil({ user, token, onProfileUpdate }) {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const fileInputRef = useRef(null);
	const [isEditing, setIsEditing] = useState(false);

	// --- ESTADOS DE SEGURIDAD ---
	const [showCurrentPass, setShowCurrentPass] = useState(false);
	const [showNewPass, setShowNewPass] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [passwordCriteria, setPasswordCriteria] = useState({
		length: false, upper: false, lower: false, number: false, special: false
	});

	// Estado del formulario
	const [formData, setFormData] = useState({
		nombres: "", apellidos: "", telefono: "", email: "", dni: "",
		distrito: "", direccion_exacta: "", foto_perfil: "",
		ingresos_mensuales: 0, tipo_trabajador: "dependiente",
		estado_civil: "soltero", numero_hijos: 0, antiguedad_laboral: 0,
		ahorro_inicial_disponible: 0, tiene_deudas_vigentes: false, pago_mensual_deudas: 0,
		
		// --- CAMPOS DE DECLARACIÓN JURADA ---
		no_propiedad_previa: false,
		no_bono_previo: false,
	});

	const [passData, setPassData] = useState({
		currentPassword: "", newPassword: "", confirmPassword: ""
	});

	// --- CÁLCULO DE PROGRESO DEL PERFIL ---
	const calculateProgress = () => {
		let score = 20; // Base por registrarse
		
		if (formData.distrito) score += 10;
		if (formData.ingresos_mensuales > 0) score += 20;
		if (formData.antiguedad_laboral > 0) score += 20;
		if (formData.ahorro_inicial_disponible > 0) score += 20;
		if (formData.no_propiedad_previa && formData.no_bono_previo) score += 10; 

		return Math.min(100, score);
	};
	const progress = calculateProgress();

	// --- EFECTO: FORTALEZA PASSWORD ---
	useEffect(() => {
		const pwd = passData.newPassword;
		const criteria = {
			length: pwd.length >= 8, upper: /[A-Z]/.test(pwd), lower: /[a-z]/.test(pwd), 
			number: /[0-9]/.test(pwd), special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
		};
		setPasswordCriteria(criteria);
		const score = Object.values(criteria).filter(Boolean).length;
		setPasswordStrength(score * 20); 
	}, [passData.newPassword]);

	const getStrengthColor = () => { if (passwordStrength <= 20) return "bg-red-500"; if (passwordStrength <= 60) return "bg-yellow-500"; return "bg-green-500"; };
	const getStrengthLabel = () => {
		if (passwordStrength === 0) return "";
		if (passwordStrength <= 20) return "Muy Débil";
		if (passwordStrength <= 40) return "Débil";
		if (passwordStrength <= 60) return "Media";
		if (passwordStrength <= 80) return "Fuerte";
		return "Muy Segura";
	};

	// --- RESETEAR Y PARSEAR DIRECCIÓN ---
	const resetFormToUser = (userData) => {
		if (!userData) return;

		const fullDir = userData.direccion || "";
		let distritoInit = "";
		let direccionInit = fullDir;

		const partes = fullDir.split(" - ");
		if (partes.length > 1 && DISTRITOS_LIMA_CALLAO.includes(partes[0])) {
			distritoInit = partes[0];
			direccionInit = partes.slice(1).join(" - ");
		}

		setFormData({
			nombres: userData.nombre || userData.nombres || "", apellidos: userData.apellido || userData.apellidos || "",
			telefono: userData.telefono || "", email: userData.email || "", dni: userData.dni || "",
			distrito: distritoInit, direccion_exacta: direccionInit,
			foto_perfil: userData.foto_perfil || "",
			
			ingresos_mensuales: userData.client?.ingresos_mensuales || 0,
			tipo_trabajador: userData.client?.tipo_trabajador || "dependiente",
			estado_civil: userData.client?.estado_civil || "soltero",
			numero_hijos: userData.client?.numero_hijos || 0,
			antiguedad_laboral: userData.client?.antiguedad_laboral || 0,
			ahorro_inicial_disponible: userData.client?.ahorro_inicial_disponible || 0,
			tiene_deudas_vigentes: userData.client?.tiene_deudas_vigentes || false,
			pago_mensual_deudas: userData.client?.pago_mensual_deudas || 0,
			
			// LECTURA DE DECLARACIONES JURADAS
			no_propiedad_previa: userData.client?.no_propiedad_previa || false,
			no_bono_previo: userData.client?.no_bono_previo || false,
		});
	};

	useEffect(() => {
		resetFormToUser(user);
	}, [user]);

	const toggleEditing = () => {
		if (isEditing) {
			resetFormToUser(user);
			setMessage({ type: "info", text: "Edición cancelada." });
			setTimeout(() => setMessage({ type: "", text: "" }), 2000);
		} else {
			setMessage({ type: "", text: "" });
		}
		setIsEditing(!isEditing);
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
	};

	const handlePassChange = (e) => {
		const { name, value } = e.target;
		setPassData(prev => ({ ...prev, [name]: value }));
	};

	// --- SUBIR FOTO ---
	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			setMessage({ type: "error", text: "La imagen no debe pesar más de 2MB." });
			return;
		}
		const uploadData = new FormData();
		uploadData.append("file", file);
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/api/auth/upload-avatar`, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: uploadData });
			if (!res.ok) throw new Error("Error al subir imagen");
			const data = await res.json();
			setFormData(prev => ({ ...prev, foto_perfil: data.url }));
			setMessage({ type: "success", text: "Foto actualizada." });
			if (onProfileUpdate) onProfileUpdate();
		} catch (error) {
			setMessage({ type: "error", text: "Error al subir la imagen." });
		} finally {
			setLoading(false);
		}
	};

	// --- GUARDAR PERFIL (FUNCIÓN CORREGIDA) ---
	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const direccionFinal = formData.distrito 
				? `${formData.distrito} - ${formData.direccion_exacta}`
				: formData.direccion_exacta;

			// 1. Usuario (Datos Personales)
			const userPayload = {
				nombres: formData.nombres, apellidos: formData.apellidos, telefono: formData.telefono, dni: formData.dni, direccion: direccionFinal,
			};
			const resUser = await fetch(`${API_URL}/api/auth/me`, { method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(userPayload) });
			if (!resUser.ok) throw new Error("Error al actualizar datos personales");

			// 2. Cliente (Datos Financieros)
			const clientPayload = {
				ingresos_mensuales: parseFloat(formData.ingresos_mensuales), tipo_trabajador: formData.tipo_trabajador,
				estado_civil: formData.estado_civil, numero_hijos: parseInt(formData.numero_hijos),
				antiguedad_laboral: parseInt(formData.antiguedad_laboral),
				ahorro_inicial_disponible: parseFloat(formData.ahorro_inicial_disponible),
				tiene_deudas_vigentes: formData.tiene_deudas_vigentes,
				pago_mensual_deudas: parseFloat(formData.pago_mensual_deudas || 0),
				
				// === ENVIAMOS DECLARACIONES JURADAS (BFH) ===
				no_propiedad_previa: formData.no_propiedad_previa,
				no_bono_previo: formData.no_bono_previo,
			};
			
			const resClient = await fetch(`${API_URL}/api/client/me`, {
				method: "PUT",
				headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
				body: JSON.stringify(clientPayload)
			});
			if (!resClient.ok) throw new Error("Error al actualizar datos financieros");
			
			// --- CORRECCIÓN APLICADA AQUÍ ---
			// Actualizar el estado local (formData) inmediatamente con los valores que sabemos que se guardaron.
			setFormData(prev => ({
				...prev,
				no_propiedad_previa: clientPayload.no_propiedad_previa,
				no_bono_previo: clientPayload.no_bono_previo,
			}));
			// ---------------------------------


			setMessage({ type: "success", text: "¡Perfil actualizado correctamente!" });
			if (onProfileUpdate) await onProfileUpdate(); // Carga los nuevos datos en App.jsx
			setIsEditing(false);

		} catch (error) {
			console.error(error);
			setMessage({ type: "error", text: "Hubo un problema al guardar." });
		} finally {
			setLoading(false);
		}
	};

	// --- CAMBIAR PASSWORD ---
	const handleUpdatePassword = async (e) => {
		e.preventDefault();
		
		if (passwordStrength < 80) { setMessage({ type: "error", text: "La nueva contraseña es demasiado débil." }); return; }
		if (passData.newPassword !== passData.confirmPassword) { setMessage({ type: "error", text: "Las nuevas contraseñas no coinciden." }); return; }
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/api/auth/change-password`, { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ current_password: passData.currentPassword, new_password: passData.newPassword }) });
			if (!res.ok) throw new Error("Error al cambiar contraseña");
			setMessage({ type: "success", text: "Contraseña actualizada." });
			setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
			setPasswordStrength(0);
		} catch (error) {
			setMessage({ type: "error", text: error.message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['Poppins'] py-10 px-4">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
				
				{/* --- COLUMNA IZQUIERDA (FOTO Y SCORING) --- */}
				<div className="md:col-span-1 space-y-6">
					<div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center relative overflow-hidden">
						<div className="absolute top-0 left-0 w-full h-32 bg-blue-100/50 rounded-b-[50%] -mt-16"></div>
						<div className="relative z-10 w-40 h-40 mb-6 group">
							<div className="w-full h-full rounded-full border-4 border-white shadow-xl bg-gray-100 overflow-hidden flex items-center justify-center">
								{formData.foto_perfil ? (<img src={formData.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />) : ( <SimpleUserIcon /> )}
							</div>
							<input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
							<button onClick={() => isEditing && fileInputRef.current.click()} className={`absolute bottom-2 right-2 p-2.5 rounded-full text-white transition-all shadow-md ${isEditing ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
							</button>
						</div>
						<h2 className="text-gray-500 font-medium tracking-wide uppercase text-sm mb-1">Bienvenido,</h2>
						<h1 className="text-2xl font-bold text-blue-900 mb-6 break-words w-full">{user?.username}</h1>
						<button onClick={toggleEditing} className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${isEditing ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"}`}>
							{isEditing ? (<span>Cancelar Edición</span>) : (<span>Editar Perfil</span>)}
						</button>
					</div>

					<div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg text-white">
						<div className="flex items-center gap-3 mb-3">
							<ChartIcon width={24} height={24} stroke="white" />
							<h3 className="font-bold text-lg">Potencia tu Perfil</h3>
						</div>
						<p className="text-sm opacity-90 mb-4">Completa tu información financiera para mejorar tu evaluación crediticia.</p>
						<div className="w-full bg-white/20 rounded-full h-2">
							<div className={`h-2 rounded-full transition-all duration-1000 ease-out ${progress >= 80 ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${progress}%` }}></div>
						</div>
						<div className="flex justify-between items-center mt-2">
							<span className="text-xs font-bold">{progress.toFixed(0)}% Completado</span>
							<p className="text-xs opacity-80">{progress >= 80 ? '🌟 Perfil Estelar' : (progress >= 50 ? '👍 Perfil Avanzado' : '📝 Perfil Básico')}</p>
						</div>
					</div>
				</div>

				{/* --- COLUMNA DERECHA (FORMULARIOS) --- */}
				<div className="md:col-span-2 space-y-8">
					{message.text && <div className={`p-4 rounded-xl text-center font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700' : (message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}`}>{message.text}</div>}

					{/* 1. FORMULARIO DE DATOS */}
					<div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 relative">
						{!isEditing && <div className="absolute top-6 right-6 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500 font-semibold border">Modo Lectura</div>}
						
						<form onSubmit={handleUpdateProfile}>
							<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><UserIcon className="text-blue-600 w-5 h-5"/> Datos Personales</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
								<InputField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} disabled={!isEditing} />
								<InputField label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={!isEditing} />
								<InputField label="DNI" name="dni" value={formData.dni} onChange={handleChange} disabled={!isEditing} />
								<InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={!isEditing} />
								
								{/* SELECT DISTRITO */}
								<div>
									<label className="block text-gray-700 font-bold mb-2 text-sm">Distrito:</label>
									<select name="distrito" value={formData.distrito} onChange={handleChange} disabled={!isEditing} className={`w-full rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-transparent' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}>
										<option value="">Selecciona...</option>
										{DISTRITOS_LIMA_CALLAO.map(d => <option key={d} value={d}>{d}</option>)}
										<option value="Otro">Otro (Provincia)</option>
									</select>
								</div>
								<InputField label="Dirección Exacta" name="direccion_exacta" value={formData.direccion_exacta} onChange={handleChange} disabled={!isEditing} placeholder="Calle, Nro, Urb..." />
							</div>

							<hr className="border-gray-100 my-8"/>

							{/* 2. Situación Laboral */}
							<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BriefcaseIcon className="text-purple-600 w-5 h-5"/> Situación Laboral</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
								<InputField label="Ingresos Mensuales (S/)" name="ingresos_mensuales" type="number" value={formData.ingresos_mensuales} onChange={handleChange} disabled={!isEditing} />
								<div>
									<label className="block text-gray-700 font-bold mb-2 text-sm">Tipo de Trabajo:</label>
									<select name="tipo_trabajador" value={formData.tipo_trabajador} onChange={handleChange} disabled={!isEditing} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
										<option value="dependiente">Dependiente (Planilla)</option>
										<option value="independiente">Independiente (RUC)</option>
									</select>
								</div>
								<InputField label="Antigüedad Laboral (Meses)" name="antiguedad_laboral" type="number" value={formData.antiguedad_laboral} onChange={handleChange} disabled={!isEditing} placeholder="Ej: 24" />
							</div>

							<hr className="border-gray-100 my-8"/>

							{/* 3. Datos Financieros */}
							<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><CashIcon className="text-green-600 w-5 h-5"/> Perfil Financiero</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
								<div>
									<label className="block text-gray-700 font-bold mb-2 text-sm">Estado Civil:</label>
									<select name="estado_civil" value={formData.estado_civil} onChange={handleChange} disabled={!isEditing} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
										<option value="soltero">Soltero/a</option>
										<option value="casado">Casado/a</option>
										<option value="conviviente">Conviviente</option>
									</select>
								</div>
								<InputField label="Número de Hijos" name="numero_hijos" type="number" value={formData.numero_hijos} onChange={handleChange} disabled={!isEditing} />
								<InputField label="Ahorro Inicial Disponible (S/)" name="ahorro_inicial_disponible" type="number" value={formData.ahorro_inicial_disponible} onChange={handleChange} disabled={!isEditing} />
								
								{/* DECLARACIONES BFH (CORREGIDO PARA NEGRITA) */}
								<div className="md:col-span-2 space-y-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
									<h4 className="text-sm font-bold text-blue-800 mb-2">Declaraciones Juradas Bono BFH</h4>
									
									<div className="flex items-start">
										<input type="checkbox" name="no_propiedad_previa" checked={formData.no_propiedad_previa} onChange={handleChange} disabled={!isEditing} className="w-5 h-5 text-blue-600 rounded mr-2" />
										<label className="text-gray-700 text-sm">
											Declaro <span className="font-bold">NO</span> ser propietario de otra vivienda o terreno a nivel nacional.
										</label>
									</div>
									
									<div className="flex items-start">
										<input type="checkbox" name="no_bono_previo" checked={formData.no_bono_previo} onChange={handleChange} disabled={!isEditing} className="w-5 h-5 text-blue-600 rounded mr-2" />
										<label className="text-gray-700 text-sm">
											Declaro <span className="font-bold">NO</span> haber recibido apoyo habitacional previo del Estado.
										</label>
									</div>
									<p className="text-[10px] text-red-600 mt-2">Marcar ambas es OBLIGATORIO para la elegibilidad del Bono Techo Propio.</p>
								</div>
								
								{/* Deudas (Condicional) */}
								<div className="flex items-center mt-8">
									<input type="checkbox" name="tiene_deudas_vigentes" checked={formData.tiene_deudas_vigentes} onChange={handleChange} disabled={!isEditing} className="w-5 h-5 text-blue-600 rounded mr-2" />
									<label className="text-gray-700 font-medium text-sm">¿Tienes otras deudas vigentes?</label>
								</div>
								{formData.tiene_deudas_vigentes && (
									<InputField label="Pago Mensual Deudas (S/)" name="pago_mensual_deudas" type="number" value={formData.pago_mensual_deudas} onChange={handleChange} disabled={!isEditing} className="animate-fade-in-down" />
								)}
							</div>

							{isEditing && (
								<div className="mt-10 flex justify-end">
									<button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-transform transform hover:-translate-y-1">
										{loading ? "Guardando..." : "GUARDAR CAMBIOS"}
									</button>
								</div>
							)}
						</form>
					</div>

					{/* 2. CAMBIAR CONTRASEÑA */}
					<div className="bg-white rounded-3xl shadow-lg p-8 md:p-10">
						<h2 className="text-2xl font-bold text-gray-800 mb-6">Seguridad</h2>
						<form onSubmit={handleUpdatePassword}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								
								{/* Contraseña Actual */}
								<div className="relative">
									<label className="block text-gray-700 font-bold mb-2 text-sm">Contraseña Actual:</label>
									<input type={showCurrentPass ? "text" : "password"} name="currentPassword" value={passData.currentPassword} onChange={handlePassChange} placeholder="••••••••" className="w-full rounded-lg py-3 px-4 pr-10 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
									<button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700">
										{showCurrentPass ? <EyeSlashIcon/> : <EyeIcon/>}
									</button>
								</div>

								{/* Nueva Contraseña */}
								<div className="space-y-4">
									<div className="relative">
										<label className="block text-gray-700 font-bold mb-2 text-sm">Nueva Contraseña:</label>
										<input type={showNewPass ? "text" : "password"} name="newPassword" value={passData.newPassword} onChange={handlePassChange} placeholder="Mínimo 8 caracteres" className="w-full rounded-lg py-3 px-4 pr-10 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
										<button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700">
											{showNewPass ? <EyeSlashIcon/> : <EyeIcon/>}
										</button>
									</div>

									{/* Barra de Fortaleza */}
									{passData.newPassword && (
										<div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
											<div className="flex justify-between items-center mb-1">
												<span className="text-xs font-bold text-gray-600">Fortaleza: {getStrengthLabel()}</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
												<div className={`h-1.5 rounded-full transition-all duration-500 ease-out ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
											</div>
											<ul className="text-[10px] space-y-1 text-gray-500">
												<li className={passwordCriteria.length ? "text-green-600" : ""}>{passwordCriteria.length ? <CheckIcon/> : <CrossIcon/>} 8+ caracteres</li>
												<li className={passwordCriteria.upper ? "text-green-600" : ""}>{passwordCriteria.upper ? <CheckIcon/> : <CrossIcon/>} Mayúscula</li>
												<li className={passwordCriteria.number ? "text-green-600" : ""}>{passwordCriteria.number ? <CheckIcon/> : <CrossIcon/>} Número</li>
											</ul>
										</div>
									)}
								</div>
								
								{/* Confirmar */}
								<div>
									<InputField label="Confirmar Nueva" name="confirmPassword" type="password" value={passData.confirmPassword} onChange={handlePassChange} placeholder="Repetir contraseña" />
									{passData.newPassword && passData.newPassword !== passData.confirmPassword && (
										<p className="text-red-500 text-xs mt-1 font-medium">No coinciden</p>
									)}
								</div>
								
								<div className="flex items-end">
									<button 
										type="submit" 
										disabled={loading || (passData.newPassword && passwordStrength < 80)} 
										className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-colors h-[50px] 
											${loading || (passData.newPassword && passwordStrength < 80) 
												? 'bg-gray-400 cursor-not-allowed' 
												: 'bg-gray-800 hover:bg-black text-white'}`}
									>
										Actualizar Clave
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

// Componente auxiliar InputField (necesario para el funcionamiento)
const InputField = ({ label, name, type = "text", value, onChange, placeholder, disabled = false, className="" }) => (
	<div className={className}>
		<label className="block text-gray-700 font-bold mb-2 text-sm">{label}:</label>
		<input type={type} name={name} value={value || ""} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-transparent' : 'bg-gray-50 border border-gray-200 text-gray-800'}`} />
	</div>
);