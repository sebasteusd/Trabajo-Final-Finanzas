import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ChartIcon } from "../assets/icons"; 

// --- Icono de WhatsApp simple inline ---
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

// --- Icono de Silueta de Admin/Agente ---
const AdminPlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
  </svg>
);

export default function PropertyDetailsModal({ property, isOpen, onClose }) {
    
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !property) return null;

    const imageUrl = property.image || (property.fotos && property.fotos.length > 0 ? property.fotos[0].url_foto : '');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency', currency: 'PEN', minimumFractionDigits: 0
        }).format(price);
    };

    const handleSimulate = () => {
        onClose(); 
        navigate("/simulador", { 
            state: { 
                propertyData: {
                    ...property,
                    price: property.price || property.precio_venta || 0,
                    address: property.address || property.direccion,
                    type: property.type || property.tipo_unidad
                }
            } 
        });
    };

    // --- FUNCIÓN: Abrir WhatsApp ---
    const handleContact = () => {
        const phoneNumber = "51999999999"; // PON AQUÍ TU NÚMERO O EL DEL AGENTE
        const message = `Hola, estoy interesado en la propiedad: ${property.address || property.direccion} que vi en CrediFácil.`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // --- FUNCIÓN: Ver en Mapa ---
    const handleOpenMap = () => {
        const addressQuery = encodeURIComponent(`${property.address || property.direccion}, ${property.city || property.lugar}, Peru`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fadeIn font-['Poppins']">
            
            {/* --- NAV DE RETORNO --- */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button 
                    onClick={onClose}
                    className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 px-5 py-2.5 rounded-full font-semibold shadow-lg transition-all flex items-center gap-2 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al listado
                </button>
            </div>

            {/* --- HERO IMAGE --- */}
            <div className="w-full h-[50vh] md:h-[60vh] relative bg-gray-200">
                {imageUrl ? (
                    <img src={imageUrl} alt={property.address} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">Sin imagen disponible</div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 -mt-20 relative z-0">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* COLUMNA IZQUIERDA (Info) */}
                    <div className="flex-1">
                        
                        {/* Cabecera */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                    {property.type}
                                </span>
                                <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                    {property.status}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight">
                                {property.address}
                            </h1>
                            <p className="text-xl text-gray-500 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {property.city}
                            </p>
                        </div>

                        {/* Grid de Características */}
                        <div className="grid grid-cols-3 gap-4 mb-10 border-y border-gray-100 py-8">
                            <FeatureBox label="Área Total" value={`${property.area} m²`} icon={<AreaIcon />} />
                            <FeatureBox label="Habitaciones" value={property.bedrooms} icon={<BedIcon />} />
                            <FeatureBox label="Baños" value={property.bathrooms} icon={<BathIcon />} />
                        </div>

                        {/* Descripción */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Sobre esta propiedad</h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                {property.description || "No hay descripción disponible para esta propiedad."}
                            </p>
                        </div>

                        {/* Ubicación CON BOTÓN FUNCIONAL */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ubicación</h3>
                            <div className="bg-gray-100 h-64 rounded-2xl flex flex-col items-center justify-center text-gray-500 relative overflow-hidden group">
                                {/* Decoración de fondo */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                                
                                <p className="mb-4 z-10 font-medium">Ubicación aproximada</p>
                                
                                <button 
                                    onClick={handleOpenMap}
                                    className="z-10 bg-white hover:bg-gray-50 text-gray-800 px-6 py-2 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105 flex items-center gap-2 border border-gray-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    Ver en Google Maps
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA (Sticky Card) */}
                    <div className="lg:w-[400px]">
                        <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-6">
                            <p className="text-gray-500 text-sm mb-1">Precio de Venta</p>
                            <h2 className="text-4xl font-bold text-[#00D443] mb-6">{formatPrice(property.price)}</h2>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={handleSimulate}
                                    className="w-full bg-[#1A56DB] hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    <ChartIcon width={24} height={24} stroke="#fff" />
                                    Simular Crédito
                                </button>
                                
                                {/* BOTÓN CONTACTAR AGENTE CON WHATSAPP */}
                                <button 
                                    onClick={handleContact}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-2 border-transparent py-4 rounded-xl text-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <WhatsAppIcon />
                                    Contactar por WhatsApp
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    {/* 🔥 AQUÍ ESTÁ EL CAMBIO: Usamos el icono de silueta en lugar de la imagen aleatoria */}
                                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
                                        <AdminPlaceholderIcon />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Agente Inmobiliario</p>
                                        <p className="text-sm text-gray-500">Mivivienda Expert</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- Iconos Internos ---
const FeatureBox = ({ label, value, icon }) => (
    <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors">
        <div className="text-blue-600 mb-2">{icon}</div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
);

const AreaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; 
const BathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;