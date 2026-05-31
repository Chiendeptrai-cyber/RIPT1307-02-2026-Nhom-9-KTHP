import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';
import { http } from './http';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const userService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    role?: string;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await http.get<ApiResponse<PaginatedResponse<User>>>('/users', { params });
    return response.data;
  },

  async update(id: number, payload: {
    fullName?: string;
    email?: string;
    status?: string;
  }): Promise<ApiResponse<User>> {
    const response = await http.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data;
  },
};
