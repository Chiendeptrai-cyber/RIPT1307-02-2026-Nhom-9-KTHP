import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';
import { http } from './http'; // Import file cấu hình axios của nhóm

export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
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
    const response = await http.get('/equipment', { params });
    return response.data;
  },

  async getDetail(id: number): Promise<ApiResponse<Equipment>> {
    const response = await http.get(`/equipment/${id}`);
    return response.data;
  },

  async create(payload: {
    name: string;
    totalQuantity: number;
    status?: string;
    categoryId?: number;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
    const response = await http.post('/equipment', payload);
    return response.data;
  },

  async update(id: number, payload: {
    name?: string;
    totalQuantity?: number;
    status?: string;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
    const response = await http.patch(`/equipment/${id}`, payload); 
    return response.data;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await http.delete(`/equipment/${id}`);
    return response.data;
  },
};