import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function login(email: string, password: string) {
  const response = await http.post<ApiResponse>('/auth/login', { email, password });
  return response.data;
}

export async function register(fullName: string, email: string, password: string) {
  const response = await http.post<ApiResponse>('/auth/register', { fullName, email, password });
  return response.data;
}
