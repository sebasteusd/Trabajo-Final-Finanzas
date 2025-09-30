// src/Components/Navbar.jsx
export default function Navbar({ user, onLogout, onChangeView }) {
  return (
    <nav className="bg-sky-600 text-white px-6 py-3 flex justify-between items-center shadow-md rounded-lg">
      {/* Información del usuario */}
      <div>
        <span className="font-semibold">{user.username}</span>{" "}
        <span className="text-sm opacity-80">({user.role})</span>
      </div>

      {/* Opciones */}
      <div className="flex gap-4">
        <button
          onClick={() => onChangeView("tsa")}
          className="hover:underline"
        >
          Simulador
        </button>

        {user.role === "admin" && (
          <button
            onClick={() => onChangeView("users")}
            className="hover:underline"
          >
            Ver usuarios
          </button>
        )}

        <button
          onClick={onLogout}
          className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
