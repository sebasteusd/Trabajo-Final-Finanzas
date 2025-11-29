import React, { useState, useEffect } from 'react';
import { HeartIcon } from "../../assets/icons";

export default function PropiedadCard({ property, formatPrice, onNavigateToSimulator, onClickDetails, token, initialIsFavorite = false }) {
  // Manejo seguro de la imagen
  const imageUrl = property.image || (property.images && property.images[0]) || (property.fotos && property.fotos[0]?.url_foto) || '';
  
  // CORRECCIÓN 1: Usar el valor inicial que viene de la base de datos
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);
  
  // CORRECCIÓN 2: Función async y recibiendo el evento 'e'
  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Evita que se abra el modal de "Detalles" al dar clic aquí
    
    // Optimistic UI: Cambiamos visualmente primero
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
        // CORRECCIÓN 3: Asegúrate de que la URL sea correcta (usamos property.id)
        const res = await fetch(`http://localhost:8000/api/favorites/${property.id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Error al actualizar favorito");
        
    } catch (error) {
        console.error(error);
        // Si falla la API, revertimos el cambio visual
        setIsFavorite(previousState);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-[24px] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-gray-100 font-['Poppins'] transition-transform hover:scale-[1.01]">
      
      {/* --- HEADER --- */}
      <div className="flex flex-row items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#DBEafe] px-4 py-1.5 rounded-full">
            <span className="text-xs sm:text-sm font-semibold text-[#1E40AF]">{property.type || "Casa"}</span>
          </div>

          {/* BOTÓN CORAZÓN */}
          <button 
            aria-label="Favorito" 
            onClick={toggleFavorite}
            className="hover:scale-110 transition-transform focus:outline-none"
          >
            <HeartIcon 
              width={24} 
              height={24} 
              fill={isFavorite ? "#EA5456" : "#97A5BF"} 
            />
          </button>
        </div>

        <div className="text-right">
          <p className="text-[#00D443] text-xl sm:text-2xl font-bold tracking-tight">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        
        {/* Imagen */}
        <div className="shrink-0 w-full sm:w-[160px] h-[130px] bg-[#F5F5F5] rounded-[16px] p-[8px]">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={property.address} 
              className="w-full h-full object-cover rounded-[12px]" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-[12px] flex items-center justify-center text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Información de Texto */}
        <div className="flex-1 flex flex-col justify-between py-0.5">
          <div>
            <h4 className="text-[#283342] text-[16px] font-semibold leading-tight line-clamp-2">
              {property.address}
            </h4>
            <p className="text-[#626C7F] text-[13px] mt-1.5 leading-snug line-clamp-2">
              {property.description}
            </p>
          </div>

          {/* Estadísticas Centradas */}
          <div className="flex justify-center items-center gap-6 mt-3 text-[#626C7F] w-full">
            <div className="text-center">
              <p className="text-[#283342] font-bold text-sm">{property.area}m²</p>
              <p className="text-[12px]">Área</p>
            </div>
            <div className="text-center">
              <p className="text-[#283342] font-bold text-sm">{property.bedrooms}</p>
              <p className="text-[12px]">Hab.</p>
            </div>
            <div className="text-center">
              <p className="text-[#283342] font-bold text-sm">{property.bathrooms}</p>
              <p className="text-[12px]">Baños</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex gap-3">
        <button
          onClick={onNavigateToSimulator}
          className="flex-1 bg-[#1A56DB] hover:bg-blue-700 text-white py-2.5 rounded-[10px] text-sm font-semibold transition-colors shadow-sm"
        >
          Simular Crédito
        </button>

        <button 
          onClick={onClickDetails}
          className="flex-1 bg-[#E5E7EB] hover:bg-gray-300 text-[#1F2937] py-2.5 rounded-[10px] text-sm font-semibold transition-colors"
        >
          Detalles
        </button>
      </div>
    </div>
  );
}