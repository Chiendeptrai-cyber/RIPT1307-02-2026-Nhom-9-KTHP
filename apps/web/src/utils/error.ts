import type { AxiosError } from 'axios';
import type { ApiResponse } from '@equipment-mgmt/shared';

export function extractApiError(err: unknown, fallback = 'Đã xảy ra lỗi'): string {
  const axiosErr = err as AxiosError<ApiResponse>;
  if (axiosErr?.response?.data?.message) {
    return axiosErr.response.data.message;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
