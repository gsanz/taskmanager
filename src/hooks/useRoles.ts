import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import type { Role } from '../types';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchRoles = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const { data } = await client.get(`/roles?page=${p}&limit=${limit}`);
      setRoles(data.data || data);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching roles', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const createRole = async (role: { name: string }) => {
    await client.post('/roles', role);
    fetchRoles();
  };

  const deleteRole = async (id: string) => {
    await client.delete(`/roles/${id}`);
    fetchRoles();
  };

  const deleteMultipleRoles = async (ids: string[]) => {
    await client.delete('/roles', { data: { ids } });
    fetchRoles();
  };

  return { roles, total, page, setPage, loading, createRole, deleteRole, deleteMultipleRoles, refetch: fetchRoles };
}
