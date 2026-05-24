import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface BorrowRequest {
  id: number;
  userId: number;
  status: string;
  expectedReturnDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  userFullName?: string;
  userEmail?: string;
  equipmentName?: string;
}

export const borrowRequestService = {
  async create(payload: {
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
    note?: string;
  }) {
    const res = await http.post<ApiResponse<BorrowRequest>>('/borrow-requests', payload);
    return res.data;
  },

  /** Lấy danh sách yêu cầu của sinh viên đang đăng nhập */
  async listMy(params?: { page?: number; pageSize?: number }) {
    const res = await http.get<ApiResponse<PaginatedResponse<BorrowRequest>>>(
      '/borrow-requests/my',
      { params },
    );
    return res.data;
  },

  /** [Admin] Lấy tất cả yêu cầu với filter */
  async listAll(params?: { page?: number; pageSize?: number; status?: string; search?: string }) {
    const res = await http.get<ApiResponse<PaginatedResponse<BorrowRequest>>>(
      '/borrow-requests',
      { params },
    );
    return res.data;
  },

  async cancel(id: number) {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/cancel`);
    return res.data;
  },

  async approve(id: number) {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/approve`);
    return res.data;
  },

  async reject(id: number, reason: string) {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/reject`, {
      reason,
    });
    return res.data;
  },
};
