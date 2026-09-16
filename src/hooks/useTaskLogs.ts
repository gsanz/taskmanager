import { useState, useCallback } from "react";
import client from "../api/client";
import type { TaskLog } from "../types";

export function useTaskLogs() {
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskLogsByDay = useCallback(
    async (date: string, userIds?: string[]) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ fecha: date });
        if (userIds !== undefined) {
          params.set("userId", userIds.join(","));
        }
        const { data } = await client.get(
          `/task-logs/day?${params.toString()}`,
        );
        setTaskLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching task logs", err);
        setTaskLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  const createTaskLog = useCallback(
    async (taskLog: {
      tareaId: string;
      fecha: string;
      descripcion: string;
      horas: number;
    }) => {
      console.log(taskLog);
      const { data } = await client.post("/task-logs", taskLog);
      return data;
    },
    [],
  );

  const updateTaskLog = useCallback(
    async (id: string, taskLog: { descripcion: string; horas: number }) => {
      const { data } = await client.patch(`/task-logs/${id}`, taskLog);
      return data;
    },
    [],
  );

  const deleteTaskLog = useCallback(async (id: string) => {
    await client.delete(`/task-logs/${id}`);
  }, []);

  const clearTaskLogs = useCallback(() => setTaskLogs([]), []);

  return {
    taskLogs,
    loading,
    fetchTaskLogsByDay,
    createTaskLog,
    updateTaskLog,
    deleteTaskLog,
    clearTaskLogs,
  };
}
