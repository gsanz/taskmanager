import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-8 text-center">TRAGSA</h1>
      <nav className="flex-1 space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Usuarios
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Tareas
        </NavLink>
        <NavLink
          to="/task-logs"
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Registro de Tareas
        </NavLink>
        <NavLink
          to="/roles"
          className={({ isActive }) =>
            `block px-4 py-2 rounded transition ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Roles
        </NavLink>
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition text-left"
      >
        Cerrar Sesión
      </button>
    </aside>
  );
}