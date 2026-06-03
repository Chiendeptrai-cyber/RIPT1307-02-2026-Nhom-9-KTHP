import { http } from './http';
import type { ApiResponse, PaginatedResponse, NotificationType } from '@equipment-mgmt/shared';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListData extends PaginatedResponse<Notification> {
  unreadCount: number;
}

export const notificationService = {
  async list(params?: { page?: number; pageSize?: number }) {
    const response = await http.get<ApiResponse<NotificationListData>>('/notifications', {
      params,
    });
    return response.data;
  },

  async markRead(id: number) {
    const response = await http.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead() {
    const response = await http.patch<ApiResponse<{ success: boolean }>>('/notifications/all/read');
    return response.data;
  },
};
