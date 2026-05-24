import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

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
  }) {
    const res = await http.get<ApiResponse<PaginatedResponse<Equipment>>>('/equipment', {
      params,
    });
    return res.data;
  },

  async getDetail(id: number) {
    const res = await http.get<ApiResponse<Equipment>>(`/equipment/${id}`);
    return res.data;
  },
};
