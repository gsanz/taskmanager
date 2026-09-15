import { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import { useAuth } from '../hooks/useAuth';
import RoleModal from '../components/RoleModal';

export default function RolesPage() {
  const { roles, total, page, setPage, loading, createRole, deleteRole, deleteMultipleRoles } = useRoles();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const roleMap = new Map(roles.map((role) => [role.id, role.nombre || role.name]));
  const currentRole = (
    currentUser?.roleName || roleMap.get(currentUser?.roleId || "") || ""
  )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const canCreateRoles =
    currentRole === "administrador" || currentRole === "manager";

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
    if (!confirm(`¿Eliminar ${selected.size} rol(es)?`)) return;
    await deleteMultipleRoles(Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roles ({total})</h1>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar ({selected.size})
            </button>
          )}
          {canCreateRoles && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Nuevo Rol
            </button>
          )}
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
                      if (e.target.checked) setSelected(new Set(roles.map((r) => r.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(role.id)}
                      onChange={() => toggleSelect(role.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {role.nombre || role.name}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteRole(role.id)}
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

      {showModal && <RoleModal onClose={() => setShowModal(false)} onSubmit={createRole} />}
    </div>
  );
}
