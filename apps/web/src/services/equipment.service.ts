import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';
import {
  OFFLINE_STORAGE_KEYS,
  apiSuccess,
  nextId,
  paginate,
  readCollection,
  writeCollection,
  type MockEquipment,
} from '../mocks/offlineStorage';

export type Equipment = MockEquipment;

function getEquipment() {
  return readCollection<Equipment>(OFFLINE_STORAGE_KEYS.equipment);
}

export const equipmentService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Equipment>>> {
    const search = params?.search?.trim().toLowerCase();
    let items = getEquipment();

    if (params?.categoryId) {
      items = items.filter((item) => item.categoryId === params.categoryId);
    }
    if (params?.status) {
      items = items.filter((item) => item.status === params.status);
    }
    if (search) {
      items = items.filter((item) => (
        item.name.toLowerCase().includes(search)
        || item.description?.toLowerCase().includes(search)
      ));
    }

    return apiSuccess(paginate(items, params?.page ?? 1, params?.pageSize ?? 20));
  },

  async getDetail(id: number): Promise<ApiResponse<Equipment>> {
    const item = getEquipment().find((equipment) => equipment.id === id);
    return apiSuccess(item ?? null, item ? 'OK' : 'Khong tim thay thiet bi') as ApiResponse<Equipment>;
  },

  async create(payload: {
    name: string;
    totalQuantity: number;
    status?: string;
    categoryId?: number;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
    const items = getEquipment();
    const equipment: Equipment = {
      id: nextId(items),
      name: payload.name,
      categoryId: payload.categoryId ?? 1,
      totalQuantity: payload.totalQuantity,
      availableQuantity: payload.totalQuantity,
      status: payload.status ?? 'active',
      description: payload.description,
    };

    writeCollection(OFFLINE_STORAGE_KEYS.equipment, [equipment, ...items]);
    return apiSuccess(equipment, 'Them thiet bi thanh cong');
  },

  async update(id: number, payload: {
    name?: string;
    totalQuantity?: number;
    status?: string;
    description?: string;
  }): Promise<ApiResponse<Equipment>> {
    const items = getEquipment();
    let updated: Equipment | null = null;

    const nextItems = items.map((item) => {
      if (item.id !== id) return item;

      const totalQuantity = payload.totalQuantity ?? item.totalQuantity;
      const availableQuantity = Math.min(item.availableQuantity, totalQuantity);
      updated = {
        ...item,
        ...payload,
        totalQuantity,
        availableQuantity,
      };
      return updated;
    });

    writeCollection(OFFLINE_STORAGE_KEYS.equipment, nextItems);
    return apiSuccess(updated, updated ? 'Cap nhat thiet bi thanh cong' : 'Khong tim thay thiet bi') as ApiResponse<Equipment>;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    const items = getEquipment();
    writeCollection(
      OFFLINE_STORAGE_KEYS.equipment,
      items.filter((item) => item.id !== id),
    );
    return apiSuccess({ id }, 'Xoa thiet bi thanh cong');
  },
};
