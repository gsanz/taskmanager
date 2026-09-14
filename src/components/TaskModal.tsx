import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types";

interface Props {
  onClose: () => void;
  onSubmit: (task: {
    nombre: string;
    fechaInicio: string;
    horasEstimadas: number;
    userId: string;
  }) => void;
  users: User[];
  isAdmin: boolean;
}

export default function TaskModal({
  onClose,
  onSubmit,
  users,
  isAdmin,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [horasEstimadas, setHorasEstimadas] = useState("");
  const [userId, setUserId] = useState("");
  const { currentUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUserId = !isAdmin && currentUser?.id ? currentUser.id : userId;
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
          {isAdmin ? (
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del usuario
              </span>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Selecciona un usuario</option>
                {users.map((u) => (
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
