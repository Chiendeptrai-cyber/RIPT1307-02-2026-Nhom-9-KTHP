import axios, { type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse } from '@equipment-mgmt/shared';

export const http = axios.create({
  // Dùng đường dẫn tương đối để request đi qua UMI dev-proxy (8000 → 3000).
  // Khi deploy, đặt UMI_APP_API_URL = '/api/v1' (Nginx proxy) hoặc URL tuyệt đối nếu khác origin.
  baseURL: process.env.UMI_APP_API_URL ?? '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => res,
  (err: AxiosError<ApiResponse>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
