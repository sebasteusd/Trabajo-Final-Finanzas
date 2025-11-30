import React, { useState } from 'react';

export default function Tooltip({ text }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      {/* El ícono de ayuda (Signo de interrogación) */}
      <button
        type="button" // Importante para que no envíe formularios
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center border border-blue-200 cursor-help hover:bg-blue-200 transition-colors"
      >
        ?
      </button>

      {/* El globo de texto (Aparece solo si isVisible es true) */}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50 animate-fade-in text-center">
          {text}
          {/* Triangulito decorativo abajo */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}