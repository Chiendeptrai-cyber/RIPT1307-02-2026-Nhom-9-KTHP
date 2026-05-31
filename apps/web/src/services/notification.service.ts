import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';
import {
  OFFLINE_STORAGE_KEYS,
  apiSuccess,
  paginate,
  readCollection,
  writeCollection,
  type MockNotification,
} from '../mocks/offlineStorage';

export type Notification = MockNotification;

function getNotifications(targetRole?: 'student' | 'admin') {
  const all = readCollection<Notification>(OFFLINE_STORAGE_KEYS.notifications)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!targetRole) return all;
  return all.filter((n) => n.targetRole === targetRole);
}

function saveNotifications(items: Notification[]) {
  writeCollection(OFFLINE_STORAGE_KEYS.notifications, items);
}

export const notificationService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    targetRole?: 'student' | 'admin';
  }): Promise<ApiResponse<PaginatedResponse<Notification> & { unreadCount: number }>> {
    const items = getNotifications(params?.targetRole);
    const paged = paginate(items, params?.page ?? 1, params?.pageSize ?? 50);

    return apiSuccess({
      ...paged,
      unreadCount: items.filter((item) => !item.isRead).length,
    });
  },

  async markRead(id: number): Promise<ApiResponse<Notification>> {
    let updated: Notification | null = null;
    const all = readCollection<Notification>(OFFLINE_STORAGE_KEYS.notifications);
    const items = all.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, isRead: true };
      return updated;
    });

    saveNotifications(items);
    return apiSuccess(updated, updated ? 'Danh dau da doc thanh cong' : 'Khong tim thay thong bao') as ApiResponse<Notification>;
  },

  async markAllRead(targetRole?: 'student' | 'admin'): Promise<ApiResponse<{ success: boolean }>> {
    const all = readCollection<Notification>(OFFLINE_STORAGE_KEYS.notifications);
    const updated = all.map((item) => {
      // If a targetRole filter is given, only mark notifications of that role as read
      if (targetRole && item.targetRole !== targetRole) return item;
      return { ...item, isRead: true };
    });
    saveNotifications(updated);
    return apiSuccess({ success: true }, 'Danh dau tat ca da doc thanh cong');
  },
};
