import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { Task } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const { currentUser, isAdmin } = useAuth();

  const fetchTasks = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit };
      if (!isAdmin && currentUser?.id) {
        params.userId = currentUser.id;
      }
      const { data } = await client.get('/tasks', { params });
      setTasks(data.data || data);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  }, [page, isAdmin, currentUser]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (task: { nombre: string; fechaInicio: string; horasEstimadas: number; userId: string }) => {
    const finalUserId = !isAdmin && currentUser?.id ? currentUser.id : task.userId;
    await client.post('/tasks', { ...task, userId: finalUserId });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await client.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const deleteMultipleTasks = async (ids: string[]) => {
    await client.delete('/tasks', { data: { ids } });
    fetchTasks();
  };

  return { tasks, total, page, setPage, loading, createTask, deleteTask, deleteMultipleTasks, refetch: fetchTasks };
}
