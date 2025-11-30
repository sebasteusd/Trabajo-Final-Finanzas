import React from 'react';
import { Link } from 'react-router-dom';
import Logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 font-['Poppins']">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10">
          
          {/* Columna 1: Branding */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={Logo}
                alt="Logo CREDIFÁCIL"
                className="w-10 h-10 rounded-full shadow-lg object-cover border-2 border-blue-500"
              />
              <h5 className="text-2xl font-bold tracking-tight">CREDIFÁCIL</h5>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Empoderando tus decisiones inmobiliarias con tecnología de simulación financiera avanzada y análisis de mercado en tiempo real.
            </p>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div>
            <h6 className="font-bold text-lg mb-4 text-blue-400">Plataforma</h6>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/simulador" className="hover:text-white hover:translate-x-1 transition-all inline-block">Simulador de Créditos</Link></li>
              <li><Link to="/oportunidades" className="hover:text-white hover:translate-x-1 transition-all inline-block">Propiedades</Link></li>
              <li><Link to="/perfil" className="hover:text-white hover:translate-x-1 transition-all inline-block">Mi Perfil</Link></li>
            </ul>
          </div>

          {/* Columna 3: Soporte (Links a la nueva page) */}
          <div>
            <h6 className="font-bold text-lg mb-4 text-green-400">Centro de Ayuda</h6>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link to="/ayuda" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  Guía de Usuario
                </Link>
              </li>
              <li>
                <Link to="/ayuda" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  Preguntas Frecuentes (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/ayuda" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  Soporte Técnico
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; 2025 CREDIFÁCIL. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}