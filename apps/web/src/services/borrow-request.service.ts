import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface BorrowRequest {
  id: number;
  userId: number;
  equipmentId: number;
  quantity: number;
  status: string;
  expectedReturnDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  userFullName?: string;
  userEmail?: string;
  equipmentName?: string;
  rejectReason?: string;
}

export const borrowRequestService = {
  async create(payload: {
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
    note?: string;
  }): Promise<ApiResponse<BorrowRequest>> {
    const response = await http.post('/borrow-requests', payload);
    return response.data;
  },

  async listMy(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<BorrowRequest>>> {
    const response = await http.get('/borrow-requests/my', { params });
    return response.data;
  },

  async listAll(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<BorrowRequest>>> {
    const response = await http.get('/borrow-requests', { params });
    return response.data;
  },

  async cancel(id: number): Promise<ApiResponse<BorrowRequest>> {
    const response = await http.patch(`/borrow-requests/${id}/cancel`);
    return response.data;
  },

  async approve(id: number): Promise<ApiResponse<BorrowRequest>> {
    const response = await http.patch(`/borrow-requests/${id}/approve`);
    return response.data;
  },

  async reject(id: number, reason: string): Promise<ApiResponse<BorrowRequest>> {
    const response = await http.patch(`/borrow-requests/${id}/reject`, { reason });
    return response.data;
  },

  async handover(id: number): Promise<ApiResponse<BorrowRequest>> {
    const response = await http.patch(`/borrow-requests/${id}/handover`);
    return response.data;
  },

  async returnEquipment(id: number): Promise<ApiResponse<BorrowRequest>> {
    const response = await http.patch(`/borrow-requests/${id}/return`);
    return response.data;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await http.delete(`/borrow-requests/${id}`);
    return response.data;
  },
};