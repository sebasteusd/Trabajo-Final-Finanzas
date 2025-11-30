import { ChartIcon, IdeaIcon } from "../assets/icons";
import { useState } from "react";

// 1. ACEPTAMOS LA NUEVA PROP 'resumen'
export default function AmortizationTable({ tabla, frecuencia = "mensual", resumen }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showAll, setShowAll] = useState(false);

  if (!tabla || tabla.length === 0) return null;

  const formatCurrency = (value) => {
    const val = Object.is(value, -0) ? 0 : value;
    return `S/ ${new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)}`;
  };

  const dataRows = tabla.slice(1);
  const totalItems = tabla.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = showAll ? tabla : tabla.slice(startIndex, endIndex);

  const totalCuotas = dataRows.length;

  // --- 2. ELIMINAMOS LOS CÁLCULOS MANUALES (CAUSANTES DEL ERROR) ---
  // const totalPagado = dataRows.reduce((sum, row) => sum + row.cuota_total, 0); 
  // const totalIntereses = dataRows.reduce((sum, row) => sum + row.interes, 0);
  
  // Usamos los valores exactos que vienen del Backend
  const totalPagado = resumen?.totalPagado || 0;
  const totalIntereses = resumen?.totalIntereses || 0;
  const totalAmortizacion = tabla.length > 0 ? tabla[0].saldo : 0;

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getRowClass = (index) => {
    const isEvenRow = index % 2 === 0;
    return `${isEvenRow ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`;
  };

  const TIPO_PERIODO = frecuencia.charAt(0).toUpperCase() + frecuencia.slice(1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* ... (El resto de tu JSX de cabecera y paginación sigue igual) ... */}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <ChartIcon width={28} height={28} fill="#1D4ED8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Tabla de Amortización</h2>
        </div>
       
        {/* ... controles de paginación ... */}
         <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
                setShowAll(false);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={showAll}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={60}>60</option>
            </select>
            <span className="text-sm text-gray-600">filas</span>
          </div>
          
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {showAll ? "Paginar" : "Ver Todo"}
          </button>
        </div>
      </div>

      {/* --- AQUÍ SE MUESTRAN LOS TOTALES CORRECTOS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Períodos</p>
          <p className="text-lg font-bold text-blue-600">{totalCuotas}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Pagado</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(totalPagado)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Intereses</p>
          <p className="text-lg font-bold text-orange-600">
            {formatCurrency(totalIntereses)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Amortizado</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(totalAmortizacion)}
          </p>
        </div>
      </div>

      {/* ... (Tabla y resto del componente igual) ... */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full">
            {/* ...thead... */}
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold sticky left-0 bg-blue-600">{TIPO_PERIODO}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Cuota</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Interés</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Amortización</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Seg. Desg</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Seg. Bien</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Portes</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Saldo</th>
              <th className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">Flujo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((fila, index) => (
              <tr key={fila.periodo} className={getRowClass(index)}>
                
                {/* Columna de Período*/}
                <td className="px-4 py-3 sticky left-0" style={{ backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB' }}>
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">
                      {fila.periodo}
                    </span>
                    <span className="text-sm text-gray-600">
                      {fila.periodo === 0 ? "Desembolso" : `Período ${fila.periodo}`}
                    </span>
                  </div>
                </td>
                
                
                {/* Cuota (P+I) */}
                <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                  {formatCurrency(fila.cuota_credito_pi)}
                </td>

                {/* Interés */}
                <td className="px-4 py-3 text-right text-orange-600 whitespace-nowrap">
                  {formatCurrency(fila.interes)}
                </td>
                
                {/* Amortización (Capital) */}
                <td className="px-4 py-3 text-right text-purple-600 whitespace-nowrap">
                  {formatCurrency(fila.amortizacion)}
                </td>
                
                {/* Seguro Desgravamen */}
                <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                  {formatCurrency(fila.seguro_desgravamen)}
                </td>
                
                {/* Seguro Bien */}
                <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                  {formatCurrency(fila.seguro_bien)}
                </td>
                
                {/* Portes */}
                <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                  {formatCurrency(fila.portes)}
                </td>
                
                {/* Saldo */}
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  {formatCurrency(fila.saldo)}
                </td>
                
                {/* Flujo */}
                <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                  fila.flujo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {fila.flujo >= 0 
                    ? formatCurrency(fila.flujo)
                    : `−${formatCurrency(Math.abs(fila.flujo))}`
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ... (Paginación y Leyenda igual) ... */}
       {!showAll && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} filas
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            {/* Lógica de botones de página */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* --- Leyenda Actualizada  --- */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-2 space-x-2 text-blue-800">
          <IdeaIcon width={18} height={18} fill="#afd81dff" />
          <h4 className="font-semibold">Interpretación de los datos:</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
          {/* Definición de "Cuota Total" eliminada */}
          <div><strong>Cuota (P+I):</strong> Suma de Interés + Amortización</div>
          <div><strong>Interés:</strong> Ganancia de la entidad financiera</div>
          <div><strong>Amortización:</strong> Parte que reduce tu deuda</div>
          <div><strong>Seg. Desg:</strong> Seguro de vida sobre el saldo</div>
          <div><strong>Seg. Bien:</strong> Seguro sobre el inmueble</div>
          <div><strong>Portes:</strong> Gastos administrativos</div>
          <div><strong>Saldo:</strong> Deuda pendiente después del pago</div>
          <div><strong>Flujo:</strong> Movimiento de efectivo</div>
        </div>
      </div>
    </div>
  );
}