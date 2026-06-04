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
  async list(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Notification> & { unreadCount: number }>> {
    const response = await http.get('/notifications', { params });
    return response.data;
  },

  async markRead(id: number): Promise<ApiResponse<Notification>> {
    const response = await http.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await http.patch('/notifications/read-all');
    return response.data;
  },
};