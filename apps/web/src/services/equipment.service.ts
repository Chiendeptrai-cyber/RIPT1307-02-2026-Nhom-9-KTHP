import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';
<<<<<<< HEAD
=======
import { http } from './http';
>>>>>>> ef361b6 (fix: ket noi thanh cong API)

export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
<<<<<<< HEAD
  categoryName?: string;
=======
>>>>>>> ef361b6 (fix: ket noi thanh cong API)
  totalQuantity: number;
  availableQuantity: number;
  status: 'active' | 'under_maintenance' | 'damaged' | 'discontinued' | 'deleted';
  description?: string;
<<<<<<< HEAD
<<<<<<< HEAD
=======
  createdAt?: string;
  updatedAt?: string;
>>>>>>> ef361b6 (fix: ket noi thanh cong API)
=======
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
>>>>>>> dbf1a18 (fix equipment)
}

export type StockAdjustType = 'import' | 'mark_damaged' | 'mark_lost' | 'adjustment';

export const equipmentService = {
<<<<<<< HEAD
  async list(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Equipment>>> {
<<<<<<< HEAD
=======
  async list(params?: { page?: number; pageSize?: number; search?: string; categoryId?: number; status?: string }): Promise<ApiResponse<PaginatedResponse<Equipment>>> {
>>>>>>> dbf1a18 (fix equipment)
    const res = await http.get<ApiResponse<PaginatedResponse<Equipment>>>('/equipment', {
      params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, ...params },
    });
    return res.data;
  },

  async listCategories(): Promise<ApiResponse<{ id: number; name: string; description?: string }[]>> {
    const res = await http.get<ApiResponse<{ id: number; name: string; description?: string }[]>>('/equipment/categories');
    return res.data;
  },

  async createCategory(payload: { name: string; description?: string }): Promise<ApiResponse<{ id: number; name: string; description?: string }>> {
    const res = await http.post<ApiResponse<{ id: number; name: string; description?: string }>>('/equipment/categories', payload);
    return res.data;
  },

  async getDetail(id: number): Promise<ApiResponse<Equipment>> {
    const res = await http.get<ApiResponse<Equipment>>(`/equipment/${id}`);
    return res.data;
=======
    const response = await http.get<ApiResponse<PaginatedResponse<Equipment>>>('/equipment', { params });
    return response.data;
  },

  async getDetail(id: number): Promise<ApiResponse<Equipment>> {
    const response = await http.get<ApiResponse<Equipment>>(`/equipment/${id}`);
    return response.data;
>>>>>>> ef361b6 (fix: ket noi thanh cong API)
  },

<<<<<<< HEAD
  async create(payload: {
    name: string;
    totalQuantity: number;
    status?: string;
    categoryId?: number;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
<<<<<<< HEAD
=======
  async create(payload: { name: string; totalQuantity: number; status?: string; categoryId?: number; description?: string }): Promise<ApiResponse<Equipment>> {
>>>>>>> dbf1a18 (fix equipment)
    const res = await http.post<ApiResponse<Equipment>>('/equipment', payload);
    return res.data;
=======
    const response = await http.post<ApiResponse<Equipment>>('/equipment', payload);
    return response.data;
>>>>>>> ef361b6 (fix: ket noi thanh cong API)
  },

<<<<<<< HEAD
  async update(id: number, payload: {
    name?: string;
    totalQuantity?: number;
    status?: string;
    categoryId?: number;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
<<<<<<< HEAD
=======
  async update(id: number, payload: { name?: string; description?: string }): Promise<ApiResponse<Equipment>> {
>>>>>>> dbf1a18 (fix equipment)
    const res = await http.patch<ApiResponse<Equipment>>(`/equipment/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const res = await http.delete<ApiResponse<{ id: number }>>(`/equipment/${id}`);
    return res.data;
=======
    const response = await http.patch<ApiResponse<Equipment>>(`/equipment/${id}`, payload);
    return response.data;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await http.delete<ApiResponse<{ id: number }>>(`/equipment/${id}`);
    return response.data;
>>>>>>> ef361b6 (fix: ket noi thanh cong API)
  },

  async stockAdjustment(id: number, payload: {
    type: StockAdjustType;
    quantity?: number;
    note?: string;
    newTotalQuantity?: number;
    newAvailableQuantity?: number;
    reason?: string;
  }): Promise<ApiResponse<Equipment>> {
    const res = await http.patch<ApiResponse<Equipment>>(`/equipment/${id}/stock-adjustment`, payload);
    return res.data;
  },

  async changeStatus(id: number, status: string): Promise<ApiResponse<Equipment>> {
    const res = await http.patch<ApiResponse<Equipment>>(`/equipment/${id}/change-status`, { status });
    return res.data;
  },
};
