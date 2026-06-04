import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';
import type { UserRole } from '@equipment-mgmt/shared';

export interface LoginResponseData {
  accessToken: string;
}

export interface UserProfile {
  userId: number;
  role: UserRole;
  fullName: string;
  email: string;
}

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<LoginResponseData>> {
  const response = await http.post<ApiResponse<LoginResponseData>>('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function register(
  fullName: string,
  email: string,
  password: string,
): Promise<ApiResponse> {
  const response = await http.post<ApiResponse>('/auth/register', { fullName, email, password });
  return response.data;
}

/** Lấy thông tin user từ JWT đang đăng nhập (GET /auth/me) */
export async function getMe(): Promise<ApiResponse<UserProfile>> {
  const response = await http.get<ApiResponse<UserProfile>>('/auth/me');
  return response.data;
}
