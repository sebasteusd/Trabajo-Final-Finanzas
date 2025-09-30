export default function AmortizationTable({ tabla }) {
  if (!tabla || tabla.length === 0) return null;

  return (
    <div className="mt-8 overflow-x-auto">
      <h2 className="text-lg font-semibold text-sky-700 mb-4">Tabla de Amortización</h2>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-sky-100">
          <tr>
            <th className="border px-2 py-1">Mes</th>
            <th className="border px-2 py-1">Cuota</th>
            <th className="border px-2 py-1">Interés</th>
            <th className="border px-2 py-1">Amortización</th>
            <th className="border px-2 py-1">Saldo</th>
            <th className="border px-2 py-1">Flujo</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((fila) => (
            <tr key={fila.mes} className="text-center">
              <td className="border px-2 py-1">{fila.mes}</td>
              <td className="border px-2 py-1">S/ {fila.cuota.toFixed(2)}</td>
              <td className="border px-2 py-1">S/ {fila.interes.toFixed(2)}</td>
              <td className="border px-2 py-1">S/ {fila.amortizacion.toFixed(2)}</td>
              <td className="border px-2 py-1">S/ {fila.saldo.toFixed(2)}</td>
              <td className="border px-2 py-1">
                {fila.flujo >= 0 ? `S/ ${fila.flujo.toFixed(2)}` : `–S/ ${Math.abs(fila.flujo).toFixed(2)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}