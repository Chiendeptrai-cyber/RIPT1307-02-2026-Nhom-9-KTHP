import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listNotifications() {
  const response = await http.get<ApiResponse>('/notifications');
  return response.data;
}

export async function markNotificationRead(id: number) {
  const response = await http.patch<ApiResponse>(`/notifications/${id}/read`);
  return response.data;
}
