import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { useAuth } from "../hooks/useAuth";
import UserModal from "../components/UserModal";

export default function UsersPage() {
  const {
    users,
    total,
    page,
    setPage,
    loading,
    createUser,
    updateUser,
    deleteUser,
    deleteMultipleUsers,
  } = useUsers();
  const { roles } = useRoles();
  const { currentUser } = useAuth();
  const roleMap = new Map(roles.map((r) => [r.id, r.nombre]));
  const currentRole = (
    currentUser?.roleName || roleMap.get(currentUser?.roleId || "") || ""
  )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const canCreateUsers =
    currentRole === "administrador" || currentRole === "manager";
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[number] | undefined>();
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

  const openCreateModal = () => {
    setEditingUser(undefined);
    setShowModal(true);
  };

  const openEditModal = (user: typeof users[number]) => {
    setEditingUser(user);
    setShowModal(true);
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
          {canCreateUsers && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Nuevo Usuario
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
                      if (e.target.checked)
                        setSelected(new Set(users.map((u) => u.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Segundo nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
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
                  <td className="px-4 py-3">{user.secondname || "-"}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {roleMap.get(user.roleId) || user.roleId}
                  </td>
                  <td className="px-4 py-3">
                    {canCreateUsers && (
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Modificar
                      </button>
                    )}
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
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <UserModal
          onClose={() => {
            setShowModal(false);
            setEditingUser(undefined);
          }}
          onSubmit={(user) => {
            if (editingUser) {
              updateUser(editingUser.id, user);
            } else {
              createUser(user as Parameters<typeof createUser>[0]);
            }
          }}
          roles={roles}
          user={editingUser}
        />
      )}
    </div>
  );
}
