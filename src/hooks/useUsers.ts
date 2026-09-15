import { useState, useEffect, useCallback } from "react";
import client from "../api/client";
import type { User } from "../types";

export function useUsers(loadAll = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = loadAll ? 1000 : 10;

  const fetchUsers = useCallback(
    async (p = page) => {
      setLoading(true);
      try {
        const { data } = await client.get(`/users?page=${p}&limit=${limit}`);
        setUsers(data.data || data);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (user: {
    email: string;
    password: string;
    name: string;
    roleId: string;
  }) => {
    await client.post("/users", user);
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await client.delete(`/users/${id}`);
    fetchUsers();
  };

  const deleteMultipleUsers = async (ids: string[]) => {
    await client.delete("/users", { data: { ids } });
    fetchUsers();
  };

  const getUserById = useCallback(async (id: string) => {
    const { data } = await client.get<User>(`/users/${id}`);
    return data;
  }, []);

  return {
    users,
    total,
    page,
    setPage,
    loading,
    createUser,
    deleteUser,
    deleteMultipleUsers,
    getUserById,
    refetch: fetchUsers,
  };
}
