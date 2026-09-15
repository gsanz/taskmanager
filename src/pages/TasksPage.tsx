import { useEffect, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { useAuth } from "../hooks/useAuth";
import TaskModal from "../components/TaskModal";

export default function TasksPage() {
  const {
    tasks,
    total,
    page,
    setPage,
    loading,
    createTask,
    deleteTask,
    deleteMultipleTasks,
  } = useTasks();
  const { users, getUserById, loading: usersLoading } = useUsers(true);
  const { roles } = useRoles();
  const { currentUser, isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taskUserNames, setTaskUserNames] = useState<Record<string, string>>(
    {},
  );

  const userMap = new Map(users.map((u) => [u.id, u.name]));

  useEffect(() => {
    const userIds = Array.from(new Set(tasks.map((task) => task.userId))).filter(
      (userId) => userId && !userMap.has(userId),
    );
    if (userIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await getUserById(userId);
          return [userId, user.name] as const;
        } catch (err) {
          console.error(`Error fetching user ${userId}`, err);
          return [userId, "Usuario no disponible"] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) {
        setTaskUserNames((names) => ({ ...names, ...Object.fromEntries(entries) }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getUserById, tasks, users]);

  const getUserName = (userId: string) => {
    if (userId === currentUser?.id && currentUser.name) return currentUser.name;
    return userMap.get(userId) || taskUserNames[userId] || "Cargando...";
  };

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
    if (!confirm(`¿Eliminar ${selected.size} tarea(s)?`)) return;
    await deleteMultipleTasks(Array.from(selected));
    setSelected(new Set());
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("es-ES");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tareas ({total})</h1>
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
            + Nueva Tarea
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
                      if (e.target.checked)
                        setSelected(new Set(tasks.map((t) => t.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Fecha Inicio</th>
                <th className="px-4 py-3 text-left">Horas Estimadas</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(task.id)}
                      onChange={() => toggleSelect(task.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{task.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(task.fechaInicio)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {task.horasEstimadas}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {getUserName(task.userId)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteTask(task.id)}
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
        <TaskModal
          onClose={() => setShowModal(false)}
          onSubmit={createTask}
          users={users}
          usersLoading={usersLoading}
          roles={roles}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
