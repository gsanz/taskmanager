import { useState, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTaskLogs } from '../hooks/useTaskLogs';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TaskLogsPage() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { taskLogs, loading: logsLoading, fetchTaskLogsByDay, createTaskLog } = useTaskLogs();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState('');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDayClick = useCallback(async (day: Date) => {
    setSelectedDay(day);
    setSelectedTaskId(null);
    setDescripcion('');
    setHoras('');
    await fetchTaskLogsByDay(format(day, 'yyyy-MM-dd'));
  }, [fetchTaskLogsByDay]);

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  const handleTaskDoubleClick = (taskId: string) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleAccept = async () => {
    if (!selectedDay || !selectedTaskId) return;
    await createTaskLog({
      tareaId: selectedTaskId,
      fecha: format(selectedDay, 'yyyy-MM-dd'),
      descripcion,
      horas: Number(horas),
    });
    await fetchTaskLogsByDay(format(selectedDay, 'yyyy-MM-dd'));
    setSelectedTaskId(null);
    setDescripcion('');
    setHoras('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registro de Tareas</h1>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
            {'<'}
          </button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
            {'>'}
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-7 gap-1 bg-white rounded-lg shadow">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
              <div key={d} className="text-center font-bold p-2 bg-gray-50 rounded-t-lg text-sm">
                {d}
              </div>
            ))}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const today = isToday(day);
              const dayStr = format(day, 'yyyy-MM-dd');
              const hasLogs = taskLogs.some((l) => l.fecha === dayStr);
              const isSelected = selectedDay && format(selectedDay, 'yyyy-MM-dd') === dayStr;
              return (
                <button
                  key={dayStr}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                  disabled={!isCurrentMonth}
                  className={`p-2 text-center rounded-md transition min-h-[100px] ${
                    !isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'
                  } ${today ? 'bg-blue-600 text-white font-bold' : isSelected ? 'bg-blue-200 border-2 border-blue-600' : 'bg-white'}`}
                >
                  <div className="text-sm">{format(day, 'd')}</div>
                  {hasLogs && <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="w-96 bg-white border-l p-6 overflow-auto flex flex-col">
          <h2 className="text-xl font-bold mb-4">
            {selectedDay ? `Tareas para ${format(selectedDay, 'dd/MM/yyyy')}` : 'Selecciona un día'}
          </h2>
          {selectedDay ? (
            <>
              <p className="text-sm text-gray-500 mb-3">Doble clic para seleccionar una tarea</p>
              <div className="space-y-2 flex-1 overflow-auto">
                {tasksLoading ? (
                  <p>Cargando tareas...</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onDoubleClick={() => handleTaskDoubleClick(task.id)}
                      className={`p-3 rounded cursor-pointer transition ${
                        selectedTaskId === task.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{task.nombre}</div>
                      <div className="text-sm text-gray-500">{task.horasEstimadas}h estimadas</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 space-y-3 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Descripción de la tarea ejecutada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horas</label>
                  <input
                    type="number"
                    step="0.5"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Horas"
                  />
                </div>
                <button
                  onClick={handleAccept}
                  disabled={!selectedTaskId}
                  className={`w-full py-2 rounded font-bold ${
                    selectedTaskId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Aceptar
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Haz clic en un día del calendario para ver las tareas</p>
          )}
        </div>
      </div>
    </div>
  );
}