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
  phoneNumber?: string | null;
  avatarUrl?: string | null;
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

export async function forgotPassword(email: string): Promise<ApiResponse<{ resetToken: string }>> {
  const response = await http.post<ApiResponse<{ resetToken: string }>>('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(token: string, passwordStr: string): Promise<ApiResponse> {
  const response = await http.post<ApiResponse>('/auth/reset-password', { token, password: passwordStr });
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
  const response = await http.patch<ApiResponse>('/users/me/password', { currentPassword, newPassword });
  return response.data;
}

export async function updateProfile(data: {
  fullName?: string;
  email?: string;
  phoneNumber?: string | null;
  avatar?: string;
}): Promise<ApiResponse<UserProfile>> {
  const response = await http.patch<ApiResponse<UserProfile>>('/users/me', data);
  return response.data;
}
