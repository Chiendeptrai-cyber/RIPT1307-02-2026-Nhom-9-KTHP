import { useCallback, useEffect, useState } from 'react';
import { equipmentService, type Equipment } from '../services/equipment.service';

interface UseEquipmentListOptions {
  search?: string;
  categoryId?: number;
  status?: string;
  pageSize?: number;
}

export function useEquipmentList(options: UseEquipmentListOptions = {}) {
  const [items, setItems] = useState<Equipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await equipmentService.list({
        page: p,
        pageSize: options.pageSize ?? 20,
        search: options.search || undefined,
        categoryId: options.categoryId,
        status: options.status,
      });
      if (res.success && res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(p);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  }, [options.search, options.categoryId, options.status, options.pageSize]);

  useEffect(() => {
    fetch(1);
  }, [fetch]);

  return { items, total, page, loading, error, refetch: fetch };
}
