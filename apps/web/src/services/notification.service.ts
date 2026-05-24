import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async list(params?: { page?: number; pageSize?: number }) {
    const res = await http.get<
      ApiResponse<PaginatedResponse<Notification> & { unreadCount: number }>
    >('/notifications', { params });
    return res.data;
  },

  async markRead(id: number) {
    const res = await http.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await http.patch<ApiResponse<{ success: boolean }>>('/notifications/all/read');
    return res.data;
  },
};
