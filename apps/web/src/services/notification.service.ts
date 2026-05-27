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

function getNotifications() {
  return readCollection<Notification>(OFFLINE_STORAGE_KEYS.notifications)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function saveNotifications(items: Notification[]) {
  writeCollection(OFFLINE_STORAGE_KEYS.notifications, items);
}

export const notificationService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Notification> & { unreadCount: number }>> {
    const items = getNotifications();
    const paged = paginate(items, params?.page ?? 1, params?.pageSize ?? 50);

    return apiSuccess({
      ...paged,
      unreadCount: items.filter((item) => !item.isRead).length,
    });
  },

  async markRead(id: number): Promise<ApiResponse<Notification>> {
    let updated: Notification | null = null;
    const items = getNotifications().map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, isRead: true };
      return updated;
    });

    saveNotifications(items);
    return apiSuccess(updated, updated ? 'Danh dau da doc thanh cong' : 'Khong tim thay thong bao') as ApiResponse<Notification>;
  },

  async markAllRead(): Promise<ApiResponse<{ success: boolean }>> {
    saveNotifications(getNotifications().map((item) => ({ ...item, isRead: true })));
    return apiSuccess({ success: true }, 'Danh dau tat ca da doc thanh cong');
  },
};
