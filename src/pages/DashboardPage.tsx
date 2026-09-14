import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/users"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
          <p className="text-gray-600">Gestionar usuarios del sistema</p>
        </Link>
        <Link
          to="/tasks"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Tareas</h2>
          <p className="text-gray-600">Gestionar tareas del sistema</p>
        </Link>

<Link
          to="/roles"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Roles</h2>
          <p className="text-gray-600">Gestionar roles del sistema</p>
        </Link>
      </div>
    </div>
  );
}
