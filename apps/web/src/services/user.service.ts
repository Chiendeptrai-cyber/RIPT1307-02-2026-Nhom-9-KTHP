import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
  search?: string;
}

/** Admin: Lấy danh sách người dùng từ DB thật */
export async function listUsers(
  params: ListUsersParams = {},
): Promise<ApiResponse<PaginatedResponse<UserDto>>> {
  const response = await http.get<ApiResponse<PaginatedResponse<UserDto>>>('/users', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 15,
      ...(params.role ? { role: params.role } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });
  return response.data;
}

/** Admin: Khóa / mở khóa tài khoản người dùng */
export async function setUserStatus(
  userId: number,
  newStatus: string,
  reason?: string,
): Promise<ApiResponse<UserDto>> {
  const response = await http.put<ApiResponse<UserDto>>(`/users/${userId}/lock`, {
    targetUserId: userId,
    newStatus,
    reason,
  });
  return response.data;
}

export interface ViolationDto {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  equipmentName?: string;
  expectedReturnDate?: string;
}

export async function listViolations(userId: number): Promise<ApiResponse<ViolationDto[]>> {
  const response = await http.get<ApiResponse<ViolationDto[]>>(`/users/${userId}/violations`);
  return response.data;
}
