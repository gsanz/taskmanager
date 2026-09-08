import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import type { Task } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchTasks = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const { data } = await client.get(`/tasks?page=${p}&limit=${limit}`);
      setTasks(data.data || data);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (task: { title: string; description?: string; status?: string; assignedTo?: string }) => {
    await client.post('/tasks', task);
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
