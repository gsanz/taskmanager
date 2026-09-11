import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useRoles } from '../hooks/useRoles';
import UserModal from '../components/UserModal';

export default function UsersPage() {
  const { users, total, page, setPage, loading, createUser, deleteUser, deleteMultipleUsers } = useUsers();
  const { roles } = useRoles();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(total / 10);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} usuario(s)?`)) return;
    await deleteMultipleUsers(Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios ({total})</h1>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar ({selected.size})
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(users.map((u) => u.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role ID</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.roleId}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && <UserModal onClose={() => setShowModal(false)} onSubmit={createUser} roles={roles} />}
    </div>
  );
}
