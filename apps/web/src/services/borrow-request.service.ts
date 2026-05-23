import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function createBorrowRequest(payload: { equipmentIds: number[]; expectedReturnDate: string }) {
  const response = await http.post<ApiResponse>('/borrow-requests', payload);
  return response.data;
}

export async function listBorrowRequests() {
  const response = await http.get<ApiResponse>('/borrow-requests');
  return response.data;
}
