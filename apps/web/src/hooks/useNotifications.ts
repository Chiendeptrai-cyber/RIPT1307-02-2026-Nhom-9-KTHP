import { useCallback, useEffect, useState } from 'react';
import { notificationService, type Notification } from '../services/notification.service';

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.list({ pageSize: 50 });
      if (res.success && res.data) {
        setItems(res.data.items);
        setUnreadCount(res.data.unreadCount ?? 0);
      }
    } catch {
      // Silent fail for notification count
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id: number) => {
    await notificationService.markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { items, unreadCount, loading, refetch: fetch, markRead, markAllRead };
}
