import { useState, useEffect, useCallback } from "react";
import client from "../api/client";
import type { User } from "../types";

export function useUsers(loadAll = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchUsers = useCallback(
    async (p = page) => {
      setLoading(true);
      try {
        const { data } = await client.get(`/users?page=${p}&limit=${limit}`);
        const firstPage = Array.isArray(data) ? data : data.data || [];
        const responseTotal = Array.isArray(data)
          ? firstPage.length
          : data.total || firstPage.length;

        if (!loadAll || firstPage.length === 0 || firstPage.length >= responseTotal) {
          setUsers(firstPage);
          setTotal(responseTotal);
          return;
        }

        const responseLimit = Array.isArray(data)
          ? limit
          : data.limit || firstPage.length;
        const totalPages = Math.ceil(responseTotal / responseLimit);
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            client.get(`/users?page=${index + 2}&limit=${responseLimit}`),
          ),
        );
        const allUsers = [
          ...firstPage,
          ...remainingPages.flatMap(({ data: pageData }) =>
            Array.isArray(pageData) ? pageData : pageData.data || [],
          ),
        ];
        setUsers(allUsers);
        setTotal(responseTotal);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    },
    [loadAll, page],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (user: {
    email: string;
    password: string;
    name: string;
    secondname: string;
    roleId: string;
  }) => {
    await client.post("/users", user);
    fetchUsers();
  };

  const updateUser = async (
    id: string,
    user: {
      email?: string;
      password?: string;
      name?: string;
      secondname?: string;
      roleId?: string;
    },
  ) => {
    await client.patch(`/users/${id}`, user);
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
    updateUser,
    deleteUser,
    deleteMultipleUsers,
    getUserById,
    refetch: fetchUsers,
  };
}
