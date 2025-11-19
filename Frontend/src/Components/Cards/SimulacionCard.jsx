

const SimulacionCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto my-8">
      <div className="flex justify-between items-center mb-4">
        <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
          Casa
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
          Eliminar Simulación
        </button>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold text-gray-800">Simulación #000001</p>
        <p className="text-sm text-gray-500">Realizada el 07/12/2024</p>
      </div>

      <hr className="border-t border-gray-300 my-4" />

      <div className="mb-6">
        <p className="text-gray-700 text-base">
          Credito de{' '}
          <span className="text-green-600 font-bold text-lg">S/ 750,000.000</span>
        </p>
        <p className="text-blue-600 font-semibold text-base">Credito Mi Vivienda</p>
      </div>

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 transform rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 12L3 7l3-5 5 3 5-3 3 5-3 5-5 3-5-3-3 5 3 7z"
          />
        </svg>
        <span>Ver Detalles</span>
      </button>
    </div>
  );
};

export default SimulacionCard;