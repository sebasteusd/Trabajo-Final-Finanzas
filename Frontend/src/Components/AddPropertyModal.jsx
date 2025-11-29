import React, { useState } from 'react';

export default function AddPropertyModal({ isOpen, onClose, onSave }) {
    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        direccion: '',
        lugar: '',
        tipo_unidad: 'Casa',
        precio_venta: '',
        area_m2: '',
        habitaciones: '',
        banos: '',
        descripcion: '',
        url_foto: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí podrías validar antes de enviar
        onSave(formData);
    };

    return (
        // Overlay oscuro con blur
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-['Poppins']">
            
            {/* Contenedor del Modal */}
            <div className="bg-white w-full max-w-3xl rounded-[30px] shadow-2xl overflow-hidden animate-fadeIn scale-100 transform transition-all">
                
                {/* Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Nueva Propiedad</h2>
                        <p className="text-sm text-gray-500">Completa los detalles para publicar.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Body Formulario */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Columna Izquierda: Ubicación y Precio */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Detalles Principales</h3>
                            
                            <InputGroup label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Ej: Av. Larco 123" icon={<MapIcon />} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Ciudad/Lugar" name="lugar" value={formData.lugar} onChange={handleChange} placeholder="Ej: Miraflores" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                    <select 
                                        name="tipo_unidad" 
                                        value={formData.tipo_unidad} 
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="Casa">Casa</option>
                                        <option value="Departamento">Departamento</option>
                                        <option value="Oficina">Oficina</option>
                                        <option value="Terreno">Terreno</option>
                                    </select>
                                </div>
                            </div>

                            <InputGroup label="Precio (S/)" name="precio_venta" type="number" value={formData.precio_venta} onChange={handleChange} placeholder="0.00" icon={<DollarIcon />} />
                        </div>

                        {/* Columna Derecha: Características */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Características</h3>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <InputGroup label="Área (m²)" name="area_m2" type="number" value={formData.area_m2} onChange={handleChange} placeholder="0" />
                                <InputGroup label="Habitaciones" name="habitaciones" type="number" value={formData.habitaciones} onChange={handleChange} placeholder="0" />
                                <InputGroup label="Baños" name="banos" type="number" value={formData.banos} onChange={handleChange} placeholder="0" />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea 
                                    name="descripcion" 
                                    rows="3"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                                    placeholder="Describe los puntos fuertes del inmueble..."
                                ></textarea>
                            </div>

                            <InputGroup label="URL de Foto Principal" name="url_foto" value={formData.url_foto} onChange={handleChange} placeholder="https://..." icon={<PhotoIcon />} />
                        </div>
                    </div>

                    {/* Footer Botones */}
                    <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                        >
                            Guardar Propiedad
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componentes Auxiliares para limpieza ---
const InputGroup = ({ label, name, type = "text", value, onChange, placeholder, icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${icon ? 'pl-10' : ''}`}
            />
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {icon}
                </div>
            )}
        </div>
    </div>
);

// Iconos Simples inline
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;