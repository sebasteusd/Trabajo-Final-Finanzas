import { useState } from "react";
import LoginForm from "../Components/LoginForm";
import RegisterForm from "../Components/RegisterForm";
import PasswordRecoveryForm from "../Components/PasswordRecoveryForm"; // <-- NUEVO COMPONENTE
import Logo from "../assets/Logo.png";

export default function LoginRegister({ onLogin, onBackToHome }) {
  // Ahora gestiona 3 vistas: 'login', 'register', 'recovery'
  const [currentView, setCurrentView] = useState("login");

  const handleLogin = (token) => {
    onLogin(token);
  };

  const switchToLogin = () => {
    setCurrentView("login");
  };

  const handleRegister = () => {
    setCurrentView("login");
  };

  const switchToRecovery = () => {
    setCurrentView("recovery");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                  src={Logo}
                  alt="Logo CREDIFÁCIL"
                  className="w-12 h-12 rounded-full shadow-lg object-cover"
                />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">CREDIFÁCIL</h1>
                <p className="text-sm text-gray-600">Tu simulador de créditos</p>
              </div>
            </div>
            <button
              onClick={onBackToHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </nav>

      {/* Selector de vista */}
      <div className="container mx-auto py-8 px-4">
        {/* Oculta el selector si estamos en la vista de recuperación */}
        {currentView !== "recovery" && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <button
                onClick={switchToLogin}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  currentView === "login"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setCurrentView("register")}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  currentView === "register"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>
        )}

        {/* Renderizado de Formularios */}
        {currentView === "login" && (
          <LoginForm 
            onLogin={handleLogin} 
            onSwitchToRecovery={switchToRecovery} // <-- NUEVO PROP
          />
        )}
        
        {currentView === "register" && (
          <RegisterForm onRegister={handleRegister} />
        )}

        {/* VISTA DE RECUPERACIÓN */}
        {currentView === "recovery" && (
          <PasswordRecoveryForm 
            onClose={switchToLogin} // Vuelve a la vista de login
          />
        )}

        {/* CTA inferior */}
        {currentView === "register" && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={switchToLogin}
                className="text-blue-600 hover:underline font-semibold"
              >
                Inicia Sesión
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}