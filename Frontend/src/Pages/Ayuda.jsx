import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../Components/PublicNavbar';
import Footer from '../Components/Footer';
import { RocketIcon, CreditIcon, IdeaIcon } from '../assets/icons'; 

export default function Ayuda({ user }) {
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState(null); // Estado para el modal

  const handleLoginRedirect = () => {
    navigate("/", { state: { openLogin: true } });
  };

  // --- DATOS DE LAS GUÍAS ---
  const guidesData = [
    {
      id: 1,
      icon: <RocketIcon width={30} height={30} fill="#2563EB" />,
      title: "Primeros Pasos",
      shortDesc: "Aprende a registrarte y configurar tu perfil financiero.",
      content: (
        <>
          <p className="mb-4">Para comenzar a usar CrediFácil, sigue estos pasos:</p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Haz clic en el botón <strong>"Ingresar"</strong> en la esquina superior derecha.</li>
            <li>Selecciona la opción <strong>"Registrarse"</strong> si aún no tienes cuenta.</li>
            <li>Completa el formulario con tu nombre, correo y contraseña.</li>
            <li>Una vez dentro, ve a la sección <strong>"Mi Perfil"</strong> para completar tus datos financieros (ingresos, carga familiar, etc.).</li>
          </ol>
          <div className="bg-blue-50 p-3 rounded-lg mt-4 text-sm text-blue-800 border border-blue-200">
            <strong>Tip:</strong> Cuanta más información completes en tu perfil, más preciso será el cálculo de tu Scoring Crediticio.
          </div>
        </>
      )
    },
    {
      id: 2,
      icon: <CreditIcon width={30} height={30} fill="#2563EB" />,
      title: "Simular Crédito",
      shortDesc: "Guía paso a paso para generar tu primera tabla de amortización.",
      content: (
        <>
          <p className="mb-4">Genera una proyección financiera en segundos:</p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Ve al menú <strong>"Simulador"</strong>.</li>
            <li>Ingresa el valor del inmueble que deseas comprar.</li>
            <li>Ajusta la cuota inicial (mínimo 10%) y el plazo (hasta 25 años).</li>
            <li>Si conoces la tasa de tu banco, ingrésala; si no, deja la referencial.</li>
            <li>Haz clic en <strong>"Simular Crédito"</strong> para ver tu cuota mensual y tabla de pagos.</li>
          </ol>
          <p className="mt-4">
            Puedes guardar la simulación haciendo clic en el icono de <strong>"Guardar"</strong> para compararla después.
          </p>
        </>
      )
    },
    {
      id: 3,
      icon: <IdeaIcon width={30} height={30} fill="#2563EB" />,
      title: "Entender el Scoring",
      shortDesc: "Consejos para mejorar tu puntuación y obtener mejores tasas.",
      content: (
        <>
          <p className="mb-4">El Score de CrediFácil va de 0 a 100 y mide tu atractivo para los bancos.</p>
          <h4 className="font-bold text-gray-800 mb-2">¿Cómo mejorarlo?</h4>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Ahorro Previo:</strong> Demostrar que tienes la cuota inicial lista suma muchos puntos.</li>
            <li><strong>Estabilidad Laboral:</strong> Tener más de 1 año en tu empleo actual es clave.</li>
            <li><strong>Historial Limpio:</strong> Marca "Sin deudas vigentes" solo si realmente estás al día en el sistema financiero.</li>
            <li><strong>Ubicación:</strong> Comprar en zonas con alta plusvalía mejora la calificación del riesgo.</li>
          </ul>
        </>
      )
    }
  ];

  const faqs = [
    {
      q: "¿Cómo funciona el Simulador de Crédito?",
      a: "Nuestro simulador utiliza el método de amortización francés. Ingresas el valor del inmueble, tu cuota inicial y el plazo. El sistema calcula automáticamente tu cuota mensual incluyendo seguros y portes estimados."
    },
    {
      q: "¿Cómo sé si aplico al Bono Techo Propio?",
      a: "El sistema evalúa tu perfil automáticamente. Si tus ingresos son menores a S/ 3,715 y marcas en tu perfil que no tienes propiedades previas, el simulador activará la opción del Bono (BFH) automáticamente."
    },
    {
      q: "¿Qué es el Score de Cliente?",
      a: "Es una puntuación interna del 0 al 100 que calcula nuestra IA basándose en tus ingresos, ubicación y estabilidad laboral para estimar qué tan probable es que un banco apruebe tu crédito."
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. CrediFácil cumple con la Ley de Protección de Datos Personales. Tu información financiera solo se usa para realizar los cálculos de simulación y no se comparte con terceros sin tu consentimiento."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins'] flex flex-col">
      
      {!user && <PublicNavbar onLoginClick={handleLoginRedirect} />}
      
      {/* Header */}
      <div className="bg-blue-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">¿Cómo podemos ayudarte?</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto px-4">
          Encuentra guías, tutoriales y respuestas a las dudas más comunes sobre CrediFácil.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-10 flex-grow">
        
        {/* Tarjetas de Guías Interactivas */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {guidesData.map((guide) => (
            <GuideCard 
              key={guide.id}
              icon={guide.icon}
              title={guide.title}
              desc={guide.shortDesc}
              onClick={() => setSelectedGuide(guide)} // Abrir modal
            />
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <AccordionItem key={index} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">¿Aún tienes dudas?</h3>
          <p className="text-gray-600 mb-6">Nuestro equipo de soporte está listo para ayudarte en tu proceso.</p>
          <a 
            href="mailto:soporte@credifacil.com"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-green-200"
          >
            Contáctanos por Email
          </a>
        </div>

      </div>

      {/* --- MODAL DE GUÍA DETALLADA --- */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setSelectedGuide(null)}
            ></div>
            
            {/* Contenido Modal */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in-up">
                <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            {/* Clonamos el icono para cambiarle el color a blanco si es necesario, o lo dejamos tal cual */}
                            {React.cloneElement(selectedGuide.icon, { fill: "white" })}
                        </div>
                        <h3 className="text-xl font-bold">{selectedGuide.title}</h3>
                    </div>
                    <button onClick={() => setSelectedGuide(null)} className="text-blue-200 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-8 text-gray-600 leading-relaxed text-sm md:text-base">
                    {selectedGuide.content}
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-100 text-right">
                    <button 
                        onClick={() => setSelectedGuide(null)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Footer GLOBAL (Se renderiza siempre al final por Layout, pero si aquí está fuera de Routes, se vería doble. 
          NOTA: Si App.jsx ya tiene el Footer global, quítalo de aquí. Si no, déjalo.) */}
      {/* <Footer />  <-- Descomentar si no está en App.jsx */}
    </div>
  );
}

// --- Subcomponentes ---

const GuideCard = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 border-blue-500 cursor-pointer group transform hover:-translate-y-1"
  >
    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
    <button className="text-blue-600 text-sm font-semibold mt-4 hover:underline flex items-center gap-1">
        Leer guía completa 
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
    </button>
  </div>
);

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none group"
      >
        <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-500'}`}>
          {question}
        </span>
        <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45 text-blue-600' : 'text-gray-400'}`}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-4 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};