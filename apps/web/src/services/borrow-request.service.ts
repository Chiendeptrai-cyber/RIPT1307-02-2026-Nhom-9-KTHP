import { http } from './http';
import { notifyNotificationChanged } from './notification.service';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface BorrowRequest {
  id: number;
  displayCode?: string;          // PH-YYYYMMDD-XXXXX
  userId: number;
  equipmentId?: number;
  quantity?: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'borrowing' | 'overdue' | 'returned';
  expectedReturnDate: string;
  note?: string;
  rejectReason?: string;
  approvedAt?: string;
  borrowedAt?: string;
  borrowStartDate?: string;
  returnedAt?: string;
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
  }): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.post<ApiResponse<BorrowRequest>>('/borrow-requests', payload);
    if (res.data.success) {
      notifyNotificationChanged();
    }
    return res.data;
  },

  async listMy(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<BorrowRequest>>> {
    const res = await http.get<ApiResponse<PaginatedResponse<BorrowRequest>>>('/borrow-requests/my', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return res.data;
  },

  async listAll(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<BorrowRequest>>> {
    const res = await http.get<ApiResponse<PaginatedResponse<BorrowRequest>>>('/borrow-requests', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        status: params?.status || undefined,
        search: params?.search || undefined,
      },
    });
    return res.data;
  },

  async cancel(id: number): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/cancel`);
    return res.data;
  },

  async approve(id: number): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/approve`);
    return res.data;
  },

  async reject(id: number, reason: string): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/reject`, { reason });
    return res.data;
  },

  async markReceived(id: number): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/mark-received`);
    return res.data;
  },

  async markNotReceived(id: number): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/mark-not-received`);
    return res.data;
  },

  async markReturned(id: number): Promise<ApiResponse<BorrowRequest>> {
    const res = await http.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}/mark-returned`);
    return res.data;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const res = await http.delete<ApiResponse<{ id: number }>>(`/borrow-requests/${id}`);
    return res.data;
  },

  async listDueOverdue(): Promise<ApiResponse<BorrowRequest[]>> {
    const res = await http.get<ApiResponse<BorrowRequest[]>>('/borrow-requests/due-overdue');
    return res.data;
  },
};
