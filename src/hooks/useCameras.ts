import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import type { Camera } from '../types';

export function useCameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchCameras = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const { data } = await client.get(`/cameras?page=${p}&limit=${limit}`);
      setCameras(data.data || data);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching cameras', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCameras(); }, [fetchCameras]);

  const createCamera = async (camera: { name: string; ip: string; location?: string; description?: string }) => {
    await client.post('/cameras', camera);
    fetchCameras();
  };

  const deleteCamera = async (id: string) => {
    await client.delete(`/cameras/${id}`);
    fetchCameras();
  };

  const deleteMultipleCameras = async (ids: string[]) => {
    await client.delete('/cameras', { data: { ids } });
    fetchCameras();
  };

  return { cameras, total, page, setPage, loading, createCamera, deleteCamera, deleteMultipleCameras, refetch: fetchCameras };
}
