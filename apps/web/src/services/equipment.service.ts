import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  totalQuantity: number;
  availableQuantity: number;
  status: string;
  description?: string;
}

export const equipmentService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Equipment>>> {
    const res = await http.get<ApiResponse<PaginatedResponse<Equipment>>>('/equipment', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search || undefined,
        categoryId: params?.categoryId || undefined,
        status: params?.status || undefined,
      },
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
  },

  async create(payload: {
    name: string;
    totalQuantity: number;
    status?: string;
    categoryId?: number;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
    const res = await http.post<ApiResponse<Equipment>>('/equipment', payload);
    return res.data;
  },

  async update(id: number, payload: {
    name?: string;
    totalQuantity?: number;
    status?: string;
    categoryId?: number;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
    const res = await http.patch<ApiResponse<Equipment>>(`/equipment/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const res = await http.delete<ApiResponse<{ id: number }>>(`/equipment/${id}`);
    return res.data;
  },
};
