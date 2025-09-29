import { useState } from "react";

export default function CreditForm({ onSimulate }) {
  const [form, setForm] = useState({
    monto: 100000,
    tasa: 8.5,
    tipo_tasa: "efectiva",
    capitalizacion: "",
    plazo_meses: 240,
    moneda: "PEN",
    gracia: "ninguna",
    bono_techo_propio: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      capitalizacion: form.tipo_tasa === "nominal" ? parseInt(form.capitalizacion) : null,
      bono_techo_propio: parseFloat(form.bono_techo_propio)
    };
    onSimulate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-sky-700">Configuración del Crédito</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          Monto (S/ o US$)
          <input name="monto" type="number" value={form.monto} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col">
          Tasa (%)
          <input name="tasa" type="number" value={form.tasa} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col">
          Tipo de tasa
          <select name="tipo_tasa" value={form.tipo_tasa} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1">
            <option value="efectiva">Efectiva</option>
            <option value="nominal">Nominal</option>
          </select>
        </label>

        {form.tipo_tasa === "nominal" && (
          <label className="flex flex-col">
            Capitalización anual
            <input name="capitalizacion" type="number" value={form.capitalizacion} onChange={handleChange}
              className="mt-1 border rounded px-2 py-1" />
          </label>
        )}

        <label className="flex flex-col">
          Plazo (meses)
          <input name="plazo_meses" type="number" value={form.plazo_meses} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col">
          Moneda
          <select name="moneda" value={form.moneda} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1">
            <option value="PEN">Soles</option>
            <option value="USD">Dólares</option>
          </select>
        </label>

        <label className="flex flex-col">
          Periodo de gracia
          <select name="gracia" value={form.gracia} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1">
            <option value="ninguna">Ninguna</option>
            <option value="total">Total</option>
            <option value="parcial">Parcial</option>
          </select>
        </label>

        <label className="flex flex-col">
          Bono Techo Propio (S/)
          <input name="bono_techo_propio" type="number" value={form.bono_techo_propio} onChange={handleChange}
            className="mt-1 border rounded px-2 py-1" />
        </label>
      </div>

      <button type="submit"
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded transition">
        Simular Crédito
      </button>
    </form>
  );
}