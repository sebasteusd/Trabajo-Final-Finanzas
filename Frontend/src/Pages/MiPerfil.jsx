import React, { useState, useEffect, useRef } from "react";

// Icono simple de usuario (SVG Inline)
const SimpleUserIcon = () => (
  <svg className="text-gray-300 w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function MiPerfil({ user, token }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    
    // Referencia para el input de archivo oculto
    const fileInputRef = useRef(null);
    
    // Estado de Edición: Inicialmente falso (bloqueado)
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        telefono: "",
        email: "",
        dni: "",
        direccion: "",
        ingresos_mensuales: "",
        foto_perfil: ""
    });

    const [passData, setPassData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Función para resetear los datos al estado original del usuario
    const resetFormToUser = (userData) => {
        if (!userData) return;
        setFormData({
            // Manejamos alias singular/plural por si acaso
            nombres: userData.nombre || userData.nombres || "", 
            apellidos: userData.apellido || userData.apellidos || "",
            telefono: userData.telefono || "",
            email: userData.email || "",
            dni: userData.dni || "",
            direccion: userData.direccion || "",
            // Datos del cliente financiero
            ingresos_mensuales: userData.client?.ingresos_mensuales || "",
            foto_perfil: userData.foto_perfil || ""
        });
    };

    // Cargar datos al montar
    useEffect(() => {
        resetFormToUser(user);
    }, [user]);

    // Activar/Desactivar Edición
    const toggleEditing = () => {
        if (isEditing) {
            // Si cancela, revertimos los cambios
            resetFormToUser(user);
            setMessage({ type: "info", text: "Edición cancelada." });
            setTimeout(() => setMessage({ type: "", text: "" }), 2000);
        } else {
            setMessage({ type: "", text: "" });
        }
        setIsEditing(!isEditing);
    };

    // Manejadores de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePassChange = (e) => {
        const { name, value } = e.target;
        setPassData(prev => ({ ...prev, [name]: value }));
    };

    // --- SUBIR FOTO DE PERFIL ---
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
            const res = await fetch("http://localhost:8000/api/auth/upload-avatar", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // No 'Content-Type': 'application/json' aquí
                },
                body: uploadData
            });

            if (!res.ok) throw new Error("Error al subir imagen");

            const data = await res.json();
            setFormData(prev => ({ ...prev, foto_perfil: data.url }));
            setMessage({ type: "success", text: "Foto actualizada." });
            
            // Recargar para que el navbar y otros componentes vean la foto nueva
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Error al subir la imagen." });
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        if (isEditing) {
            fileInputRef.current.click();
        } else {
            setMessage({ type: "info", text: "Activa la edición para cambiar la foto." });
            setTimeout(() => setMessage({ type: "", text: "" }), 2000);
        }
    };

    // --- GUARDAR DATOS PERSONALES ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            // 1. Actualizar Usuario
            const userPayload = {
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                telefono: formData.telefono,
                dni: formData.dni,
                direccion: formData.direccion,
                email: user.email,
                username: user.username
            };

            const resUser = await fetch("http://localhost:8000/api/auth/me", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userPayload)
            });

            if (!resUser.ok) throw new Error("Error al actualizar datos personales");

            // 2. Actualizar Cliente (Financiero)
            if (formData.ingresos_mensuales) {
                const clientPayload = {
                    ingresos_mensuales: parseFloat(formData.ingresos_mensuales)
                };
                
                const resClient = await fetch("http://localhost:8000/api/clients/me", {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(clientPayload)
                });

                if (!resClient.ok) throw new Error("Error al actualizar datos financieros");
            }

            setMessage({ type: "success", text: "¡Datos guardados correctamente!" });
            setIsEditing(false);
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Hubo un problema al guardar." });
        } finally {
            setLoading(false);
        }
    };

    // --- CAMBIAR CONTRASEÑA ---
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            setMessage({ type: "error", text: "Las nuevas contraseñas no coinciden." });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    current_password: passData.currentPassword,
                    new_password: passData.newPassword
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Error al cambiar contraseña");
            }

            setMessage({ type: "success", text: "Contraseña actualizada." });
            setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });

        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['Poppins'] py-10 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* --- COLUMNA IZQUIERDA (Tarjeta Perfil) --- */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-blue-100/50 rounded-b-[50%] -mt-16"></div>
                        
                        <div className="relative z-10 w-40 h-40 mb-6 group">
                            <div className="w-full h-full rounded-full border-4 border-white shadow-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                                {formData.foto_perfil ? (
                                    <img src={formData.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <SimpleUserIcon />
                                )}
                            </div>
                            
                            {/* Input oculto y botón cámara */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                            <button 
                                onClick={triggerFileInput}
                                className={`absolute bottom-2 right-2 p-2.5 rounded-full text-white transition-all shadow-md transform hover:scale-110 
                                    ${isEditing ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                title="Cambiar foto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>

                        <h2 className="text-gray-500 font-medium tracking-wide uppercase text-sm mb-1">Bienvenido de vuelta,</h2>
                        <h1 className="text-3xl font-bold text-blue-900 mb-6 break-words w-full">{user?.username}</h1>

                        <button 
                            onClick={toggleEditing}
                            className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 
                                ${isEditing 
                                    ? "bg-red-100 text-red-600 hover:bg-red-200" 
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"
                                }`}
                        >
                            {isEditing ? (
                                <>
                                    <span>Cancelar Edición</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </>
                            ) : (
                                <>
                                    <span>Editar Perfil</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA (Formularios) --- */}
                <div className="md:col-span-2 space-y-8">
                    
                    {message.text && (
                        <div className={`p-4 rounded-xl text-center font-semibold animate-fadeIn ${message.type === 'success' ? 'bg-green-100 text-green-700' : (message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}`}>
                            {message.text}
                        </div>
                    )}

                    {/* DATOS PERSONALES */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 relative transition-all">
                        {!isEditing && (
                            <div className="absolute top-4 right-4 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500 font-semibold border border-gray-200">
                                Modo Lectura
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <InputField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} disabled={!isEditing} />
                                <InputField label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={!isEditing} />
                                <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+51 999 999 999" disabled={!isEditing} />
                                <InputField label="Correo Electrónico" name="email" value={formData.email} onChange={handleChange} disabled={true} />
                                <InputField label="DNI" name="dni" value={formData.dni} onChange={handleChange} disabled={!isEditing} />
                                <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} disabled={!isEditing} />
                                
                                <div className="md:col-span-1">
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Ingresos Mensuales:</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="ingresos_mensuales"
                                            value={formData.ingresos_mensuales}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full text-gray-700 rounded-lg py-3 px-4 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${!isEditing ? 'bg-gray-200 opacity-70 cursor-not-allowed' : 'bg-gray-100'}`}
                                            placeholder="0.00"
                                        />
                                        <span className="absolute left-3 top-3 text-gray-500 font-semibold">S/</span>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-8 animate-fadeIn flex justify-end">
                                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                                        {loading ? "Guardando..." : "GUARDAR DATOS"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* CAMBIAR CONTRASEÑA */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">Cambiar Contraseña</h2>
                        
                        <form onSubmit={handleUpdatePassword}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <InputField label="Contraseña Actual" name="currentPassword" type="password" value={passData.currentPassword} onChange={handlePassChange} placeholder="••••••••" />
                                <InputField label="Nueva Contraseña" name="newPassword" type="password" value={passData.newPassword} onChange={handlePassChange} placeholder="Mínimo 8 caracteres" />
                                <InputField label="Confirmar Nueva" name="confirmPassword" type="password" value={passData.confirmPassword} onChange={handlePassChange} placeholder="Repetir contraseña" />
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                                    GUARDAR CONTRASEÑA
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Componente auxiliar InputField
const InputField = ({ label, name, type = "text", value, onChange, placeholder, disabled = false }) => (
    <div>
        <label className="block text-gray-700 font-bold mb-2 text-sm">{label}:</label>
        <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full text-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors 
                ${disabled 
                    ? 'bg-gray-200 opacity-70 cursor-not-allowed border border-transparent' 
                    : 'bg-gray-100 border border-gray-200'}`}
        />
    </div>
);