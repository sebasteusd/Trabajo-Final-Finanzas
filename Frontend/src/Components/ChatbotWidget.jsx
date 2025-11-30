import { useEffect } from 'react';

export default function ChatbotWidget({ user }) {
  useEffect(() => {
    // 1. Definición de la función window.chatbase
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      
      // CORRECCIÓN: Cambiamos 'arguments' por 'args' para evitar el error de Strict Mode
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };

      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...args) => target(prop, ...args);
        }
      });
    }

    // 2. Cargar el script de ChatBase
    const scriptId = "awoB6cJc8o1bVHp4v687A"; // TU ID
    const scriptSrc = "https://www.chatbase.co/embed.min.js";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.id = scriptId;
      script.domain = "www.chatbase.co";
      script.async = true;
      document.body.appendChild(script);
    }

    // 3. Identificación de usuario (Opcional, si quisieras pasar datos)
    if (user && window.chatbase) {
       // window.chatbase('identify', { email: user.email });
    }

  }, [user]); 

  return null; 
}