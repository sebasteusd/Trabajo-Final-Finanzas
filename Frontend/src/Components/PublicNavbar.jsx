import React from 'react';
import { Link } from 'react-router-dom';
import Logo from "../assets/Logo.png";

export default function PublicNavbar({ onLoginClick }) {
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40 font-['Poppins']">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* Logo y Nombre (Clickeable al Home) */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img
              src={Logo}
              alt="Logo CREDIFÁCIL"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg object-cover"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">CREDIFÁCIL</h1>
              <p className="hidden md:block text-xs text-gray-600">Tu simulador de créditos</p>
            </div>
          </Link>

          {/* Botón de Acción */}
          <div className="flex items-center gap-4">
            <Link to="/ayuda" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
                Centro de Ayuda
            </Link>
            <button
                onClick={onLoginClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-md text-sm md:text-base"
            >
                Ingresar
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}