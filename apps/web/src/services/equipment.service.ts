import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listEquipment() {
  const response = await http.get<ApiResponse>('/equipment');
  return response.data;
}

export async function getEquipmentDetail(id: number) {
  const response = await http.get<ApiResponse>(`/equipment/${id}`);
  return response.data;
}
