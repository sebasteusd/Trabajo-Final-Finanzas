import { useState } from "react";
import CreditForm from "./Components/CreditForm";
import Results from "./Components/Results";

export default function App() {
  const [result, setResult] = useState(null);

  const simulateCredit = async (payload) => {
  const res = await fetch("http://localhost:8000/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log("Respuesta del backend:", data); // 👈 Aquí
  setResult(data);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white text-gray-800">
      <header className="bg-sky-700 text-white py-6 shadow-md">
        <h1 className="text-center text-3xl font-bold tracking-wide">Simulador MiVivienda</h1>
        <p className="text-center text-sm mt-1">Calcula tu crédito con transparencia y precisión</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <CreditForm onSimulate={simulateCredit} />
        <Results data={result} />
      </main>

      <footer className="text-center text-xs text-gray-500 py-4">
        © 2025 Simulador MiVivienda · Proyecto académico
      </footer>
    </div>
  );
}