import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Role, User } from "../types";

interface Props {
  onClose: () => void;
  onSubmit: (task: {
    nombre: string;
    fechaInicio: string;
    horasEstimadas: number;
    userId: string;
  }) => void;
  users: User[];
  usersLoading: boolean;
  roles: Role[];
  isAdmin: boolean;
}

export default function TaskModal({
  onClose,
  onSubmit,
  users,
  usersLoading,
  roles,
  isAdmin,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [horasEstimadas, setHorasEstimadas] = useState("");
  const [userId, setUserId] = useState("");
  const { currentUser } = useAuth();

  const normaliseRole = (role: string) =>
    role
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const roleNames = new Map(
    roles.map((role) => [role.id, role.nombre || role.name]),
  );
  const currentRole = normaliseRole(
    currentUser?.roleName || roleNames.get(currentUser?.roleId || "") || "",
  );
  const isManager = currentRole === "manager";
  const canAssignUsers = isAdmin || isManager;
  const assignableUsers = isAdmin
    ? users
    : isManager
      ? users.filter(
          (user) =>
            normaliseRole(roleNames.get(user.roleId) || "") === "tecnico",
        )
      : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUserId = canAssignUsers && userId ? userId : currentUser?.id || "";
    onSubmit({
      nombre,
      fechaInicio,
      horasEstimadas: Number(horasEstimadas),
      userId: finalUserId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Crear Tarea</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la tarea
            </span>
            <input
              type="text"
              placeholder="Escribe el nombre de la tarea"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Inicio de la tarea
            </span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Horas dedicadas
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Indica las horas previstas"
              value={horasEstimadas}
              onChange={(e) => setHorasEstimadas(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </label>
          {canAssignUsers ? (
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del usuario
              </span>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={usersLoading}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">
                  {usersLoading ? "Cargando usuarios..." : "Selecciona un usuario"}
                </option>
                {!usersLoading && assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del usuario
              </span>
              <div className="w-full border rounded px-3 py-2 bg-gray-100">
                {currentUser?.id ? (
                  <span>
                    {currentUser.name ||
                      users.find((u) => u.id === currentUser.id)?.name ||
                      "Nombre no disponible"}
                  </span>
                ) : (
                  <span>Cargando usuario...</span>
                )}
              </div>
            </label>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
