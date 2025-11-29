import { useEffect, useState } from "react";
import SimulacionCard from "./SimulacionCard";
import axios from "axios";

export default function MisSimulaciones() {
  const [simulaciones, setSimulaciones] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroMonto, setFiltroMonto] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    axios
      .get(`http://localhost:8080/api/v1/simulaciones/usuario/${userId}`)
      .then((res) => {
        setSimulaciones(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

 
  const filtradas = simulaciones.filter((s) => {
    const matchTexto =
      filtroTexto === "" ||
      s.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      s.programa.toLowerCase().includes(filtroTexto.toLowerCase());

    const matchMonto =
      filtroMonto === "" ||
      String(s.monto).includes(filtroMonto);

    const matchFecha =
      filtroFecha === "" ||
      s.fecha === filtroFecha;

    const matchTipo =
      filtroTipo === "" || s.tipo === filtroTipo;

    return matchTexto && matchMonto && matchFecha && matchTipo;
  });

  return (
    <div className="min-h-screen px-6 py-10 bg-[#e9f0ff]">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-2">Mis Simulaciones</h1>
        <p className="text-center text-gray-600 mb-10">
          Revisa al detalle tus simulaciones realizadas
        </p>

      
        <div className="bg-white p-8 rounded-2xl shadow-md mb-10">

          <h2 className="text-xl font-semibold mb-4">Busca dentro de tus simulaciones</h2>

          
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="w-full p-3 border rounded-xl mb-6"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />

       
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          
            <div>
              <label className="text-sm font-medium">Valor del Crédito:</label>
              <input
                type="text"
                className="w-full p-3 border rounded-xl"
                placeholder="Ej: 650000"
                value={filtroMonto}
                onChange={(e) => setFiltroMonto(e.target.value)}
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="text-sm font-medium">Fecha:</label>
              <input
                type="date"
                className="w-full p-3 border rounded-xl"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>

            {/* Tipo de Unidad */}
            <div>
              <label className="text-sm font-medium">Tipo de Unidad:</label>
              <select
                className="w-full p-3 border rounded-xl"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Terreno">Terreno</option>
              </select>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Simulaciones</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtradas.length > 0 ? (
            filtradas.map((sim) => (
              <SimulacionCard key={sim.id} simulacion={sim} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No hay simulaciones con esos filtros.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
