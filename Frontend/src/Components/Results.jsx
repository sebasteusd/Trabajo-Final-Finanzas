export default function Results({ data }) {
  if (!data) return null;

  return (
    <div className="mt-8 bg-sky-50 border border-sky-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-sky-700 mb-4">Resultados de la Simulación</h2>
      <ul className="space-y-2 text-gray-700">
        <li><strong>Cuota mensual:</strong> S/ {data.cuota_mensual}</li>
        <li><strong>Total pagado:</strong> S/ {data.total_pagado}</li>
        <li><strong>Intereses pagados:</strong> S/ {data.intereses_pagados}</li>
      </ul>
    </div>
  );
}