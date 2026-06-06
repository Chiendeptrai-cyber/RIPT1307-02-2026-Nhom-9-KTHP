import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

// Notification shape returned by the backend (matches NotificationEntity)
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shape of the list response data
export interface NotificationListData extends PaginatedResponse<Notification> {
  unreadCount: number;
}

export interface AdminNotification extends Notification {
  recipient?: string;
}

export interface AdminNotificationListData extends PaginatedResponse<AdminNotification> {}

export const NOTIFICATION_CHANGED_EVENT = 'equipment-mgmt:notification-changed';

export function notifyNotificationChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATION_CHANGED_EVENT));
  }
}

export const notificationService = {
  /**
   * GET /api/v1/notifications?page=1&pageSize=20
   * Fetches paginated notifications for the authenticated user.
   */
  async list(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<NotificationListData>> {
    const response = await http.get<ApiResponse<NotificationListData>>(
      '/notifications',
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
        },
      },
    );
    return response.data;
  },

  /**
   * GET /api/v1/notifications/all?page=1&pageSize=20
   * Fetches paginated notifications for the admin.
   */
  async listAll(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<AdminNotificationListData>> {
    const response = await http.get<ApiResponse<AdminNotificationListData>>(
      '/notifications/all',
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
        },
      },
    );
    return response.data;
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   * Marks a single notification as read.
   */
  async markRead(id: number): Promise<ApiResponse<Notification>> {
    const response = await http.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`,
    );
    notifyNotificationChanged();
    return response.data;
  },

  /**
   * PATCH /api/v1/notifications/all/read
   * Marks ALL notifications of the authenticated user as read.
   */
  async markAllRead(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await http.patch<ApiResponse<{ success: boolean }>>(
      '/notifications/all/read',
    );
    notifyNotificationChanged();
    return response.data;
  },

  /**
   * POST /api/v1/notifications/send  (Admin only)
   * Sends a manual notification to a target group.
   */
  async send(data: {
    target: 'all_students' | 'overdue' | 'admin';
    title: string;
    content: string;
  }): Promise<ApiResponse<{ sent: number }>> {
    const response = await http.post<ApiResponse<{ sent: number }>>(
      '/notifications/send',
      data,
    );
    return response.data;
  },

  async getSettings(): Promise<ApiResponse<any>> {
    const response = await http.get<ApiResponse<any>>('/notifications/settings');
    return response.data;
  },

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    const response = await http.put<ApiResponse<any>>('/notifications/settings', settings);
    return response.data;
  },

  async getRetryQueue(): Promise<ApiResponse<any[]>> {
    const response = await http.get<ApiResponse<any[]>>('/notifications/retry-queue');
    return response.data;
  },

  async retryEmail(id: number): Promise<ApiResponse<any>> {
    const response = await http.post<ApiResponse<any>>(`/notifications/retry-queue/${id}/retry`);
    return response.data;
  },
};

