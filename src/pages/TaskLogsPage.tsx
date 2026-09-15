import { useState, useCallback, useEffect } from "react";
import { useTasks } from "../hooks/useTasks";
import { useTaskLogs } from "../hooks/useTaskLogs";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../hooks/useAuth";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  addDays,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

export default function TaskLogsPage() {
  const { tasks } = useTasks();
  const { currentUser, isAdmin } = useAuth();
  const { getUserById } = useUsers();
  const {
    taskLogs,
    loading: logsLoading,
    fetchTaskLogsByDay,
    createTaskLog,
  } = useTaskLogs();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [displayedDay, setDisplayedDay] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTaskId, setModalTaskId] = useState("");
  const [modalDescripcion, setModalDescripcion] = useState("");
  const [modalHoras, setModalHoras] = useState("");
  const [modalErrors, setModalErrors] = useState({
    task: false,
    descripcion: false,
    horas: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const visibleTasks = isAdmin
    ? currentUser?.id
      ? tasks.filter((task) => task.userId === currentUser.id)
      : []
    : tasks;

  useEffect(() => {
    const userIds = Array.from(
      new Set([
        ...tasks.map((task) => task.userId),
        ...taskLogs.map((log) => log.userId),
      ].filter(Boolean)),
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
      if (!cancelled) setUserNames((names) => ({ ...names, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
  }, [getUserById, taskLogs, tasks]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  useEffect(() => {
    const today = new Date();
    const nextDay = addDays(today, 1);
    setSelectedDay(today);
    setDisplayedDay(nextDay);
    fetchTaskLogsByDay(format(nextDay, "yyyy-MM-dd"));
  }, [fetchTaskLogsByDay]);

  const handleDayClick = useCallback(
    async (day: Date) => {
      const nextDay = addDays(day, 1);
      setSelectedDay(day);
      setDisplayedDay(nextDay);
      setShowModal(false);
      setModalTaskId("");
      setModalDescripcion("");
      setModalHoras("");
      setModalErrors({ task: false, descripcion: false, horas: false });
      await fetchTaskLogsByDay(format(nextDay, "yyyy-MM-dd"));
    },
    [fetchTaskLogsByDay],
  );

  const handleModalSubmit = async () => {
    const errors = {
      task: !modalTaskId,
      descripcion: !modalDescripcion.trim(),
      horas: !modalHoras.trim(),
    };
    setModalErrors(errors);

    if (
      !selectedDay ||
      !displayedDay ||
      errors.task ||
      errors.descripcion ||
      errors.horas
    )
      return;

    setSubmitting(true);
    try {
      await createTaskLog({
        tareaId: modalTaskId,
        fecha: format(selectedDay, "yyyy-MM-dd"),
        descripcion: modalDescripcion,
        horas: Number(modalHoras),
      });
      await fetchTaskLogsByDay(format(displayedDay, "yyyy-MM-dd"));
      setShowModal(false);
    } catch (err) {
      console.error("Error creating task log", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setModalTaskId("");
    setModalDescripcion("");
    setModalHoras("");
    setModalErrors({ task: false, descripcion: false, horas: false });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registro de Tareas</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate((date) => subMonths(date, 1))}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            {"<"}
          </button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setCurrentDate((date) => addMonths(date, 1))}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-7 gap-1 bg-white rounded-lg shadow">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((name) => (
              <div
                key={name}
                className="text-center font-bold p-2 bg-gray-50 rounded-t-lg text-sm"
              >
                {name}
              </div>
            ))}
            {Array.from({ length: days[0].getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}
            {days.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const isSelected =
                selectedDay && format(selectedDay, "yyyy-MM-dd") === dayStr;
              const hasLogs = taskLogs.some(
                (log) => format(new Date(log.fecha), "yyyy-MM-dd") === dayStr,
              );
              return (
                <button
                  key={dayStr}
                  onClick={() =>
                    isSameMonth(day, currentDate) && handleDayClick(day)
                  }
                  className={`p-2 text-center rounded-md transition min-h-[100px] cursor-pointer hover:bg-blue-50 ${isToday(day) ? "bg-blue-600 text-white font-bold" : isSelected ? "bg-blue-200 border-2 border-blue-600" : "bg-white"}`}
                >
                  <div className="text-sm">{format(day, "d")}</div>
                  {hasLogs && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-96 bg-white border-l p-6 overflow-auto flex flex-col">
          <h2 className="text-xl font-bold mb-4">
            {displayedDay
              ? `Tareas para ${format(displayedDay, "dd/MM/yyyy")}`
              : "Selecciona un día"}
          </h2>
          {selectedDay && (
            <>
              <button
                onClick={openModal}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Asociar Tarea al Día
              </button>
              {logsLoading ? (
                <p>Cargando registros...</p>
              ) : taskLogs.length === 0 ? (
                <p className="text-gray-400">No hay registros para este día</p>
              ) : (
                <div className="space-y-3 flex-1 overflow-auto">
                  {taskLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded border">
                      <div className="font-medium">{log.tareaNombre}</div>
                      <div className="text-sm text-gray-600">
                        Usuario: {userNames[log.userId] || "Cargando..."}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.descripcion}
                      </div>
                      <div className="text-sm text-gray-600">{log.horas}h</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {format(new Date(log.fecha), "dd/MM/yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Asociar Tarea al Día</h2>
            <p className="text-sm text-gray-500 mb-4">
              Día: {selectedDay ? format(selectedDay, "dd/MM/yyyy") : ""}
            </p>
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${modalErrors.task ? "text-red-600" : ""}`}
                >
                  Tarea {modalErrors.task && "(Seleccionar Tarea)"}
                </label>
                <select
                  value={modalTaskId}
                  onChange={(event) => {
                    setModalTaskId(event.target.value);
                    setModalErrors((errors) => ({ ...errors, task: false }));
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleccionar tarea</option>
                  {visibleTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.nombre} - Usuario: {userNames[task.userId] || "Cargando..."}
                    </option>
                  ))}
                </select>
                {modalErrors.task && (
                  <p className="mt-1 text-sm text-red-600">
                    Este campo es obligatorio.
                  </p>
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${modalErrors.descripcion ? "text-red-600" : ""}`}
                >
                  Descripción
                </label>
                <textarea
                  value={modalDescripcion}
                  onChange={(event) => {
                    setModalDescripcion(event.target.value);
                    setModalErrors((errors) => ({
                      ...errors,
                      descripcion: false,
                    }));
                  }}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Descripción de la tarea ejecutada"
                />
                {modalErrors.descripcion && (
                  <p className="mt-1 text-sm text-red-600">
                    Este campo es obligatorio.
                  </p>
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${modalErrors.horas ? "text-red-600" : ""}`}
                >
                  Horas
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={modalHoras}
                  onChange={(event) => {
                    setModalHoras(event.target.value);
                    setModalErrors((errors) => ({ ...errors, horas: false }));
                  }}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Horas"
                />
                {modalErrors.horas && (
                  <p className="mt-1 text-sm text-red-600">
                    Este campo es obligatorio.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleModalSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  {submitting ? "Guardando..." : "Aceptar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
