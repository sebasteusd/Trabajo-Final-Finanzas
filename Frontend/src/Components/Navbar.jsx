import React from "react";
import Logo from "../assets/Logo.png";

export default function Navbar({ 
  user, 
  view, 
  onChangeView, 
  onLogout
}) {
  
  const getButtonClass = (isActive) => {
    return `w-44 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-sm ${
      isActive
        ? "bg-gray-200 text-gray-500 cursor-default shadow-inner" 
        : "bg-blue-600 text-white hover:bg-blue-700"              
    }`;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <img
              src={Logo}
              alt="Logo CREDIFÁCIL"
              className="w-12 h-12 rounded-full shadow-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">CREDIFÁCIL</h1>
              <p className="text-sm text-gray-600">Simulador de Créditos</p>
            </div>
          </div>

          {/* Info Usuario y Botones */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden xl:block">
              <span className="font-semibold">{user.username}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full ml-2">
                {user.role}
              </span>
            </span>

            {/* Grupo de Navegación */}
            <div className="flex space-x-2">
              
              <button
                onClick={() => onChangeView("welcome")}
                className={getButtonClass(view === "welcome")}
              >
                Inicio
              </button>

              <button
                onClick={() => onChangeView("tsa")}
                className={getButtonClass(view === "tsa")}
              >
                Simulador
              </button>

              <button
                onClick={() => onChangeView("simulations")}
                className={getButtonClass(view === "simulations")}
              >
                Mis Simulaciones
              </button>

              <button
                onClick={() => onChangeView("favorites")}
                className={getButtonClass(view === "favorites")}
              >
                Mis Favoritos
              </button>

              <button
                onClick={() => onChangeView("profile")}
                className={getButtonClass(view === "profile")}
              >
                Mi Perfil
              </button>

              {user.role === "admin" && (
                <button
                  onClick={() => onChangeView("users")}
                  className={getButtonClass(view === "users")}
                >
                  Usuarios
                </button>
              )}
            </div>

            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors ml-4"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}