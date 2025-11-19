


export default function PropiedadCard({ property, formatPrice, onNavigateToSimulator }) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-blue-800">{property.type}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</p>
        </div>
      </div>
      
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{property.address}</h4>
      <p className="text-gray-600 text-sm mb-4">{property.description}</p>
      
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
        <div className="text-center">
          <p className="font-semibold">{property.area}m²</p>
          <p>Área</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{property.bedrooms}</p>
          <p>Habitaciones</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{property.bathrooms}</p>
          <p>Baños</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={onNavigateToSimulator}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
        >
          Simular Crédito
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
          Ver Detalles
        </button>
      </div>
    </div>
  );
}