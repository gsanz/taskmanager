import { useState, useCallback } from 'react';
import client from '../api/client';
import type { TaskLog } from '../types';

export function useTaskLogs() {
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskLogsByDay = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const { data } = await client.get(`/task-logs/day?fecha=${date}`);
      setTaskLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching task logs', err);
      setTaskLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);
  const createTaskLog = useCallback(async (taskLog: { tareaId: string; fecha: string; descripcion: string; horas: number }) => {
    console.log(taskLog);
    const { data } = await client.post('/task-logs', taskLog);
    return data;
  }, []);

  return { taskLogs, loading, fetchTaskLogsByDay, createTaskLog };
}
