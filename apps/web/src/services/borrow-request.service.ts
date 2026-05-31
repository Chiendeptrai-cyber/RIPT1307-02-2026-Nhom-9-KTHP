import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';
import {
  OFFLINE_STORAGE_KEYS,
  apiSuccess,
  createNotification,
  nextId,
  paginate,
  readCollection,
  writeCollection,
  type MockBorrowRequest,
  type MockEquipment,
} from '../mocks/offlineStorage';

export type BorrowRequest = MockBorrowRequest;

const MOCK_CURRENT_USER = {
  id: 1,
  fullName: 'Nguyen Van An',
  email: 'an.nguyen@student.ptit.edu.vn',
};

function getRequests() {
  return readCollection<BorrowRequest>(OFFLINE_STORAGE_KEYS.borrowRequests);
}

function saveRequests(items: BorrowRequest[]) {
  writeCollection(OFFLINE_STORAGE_KEYS.borrowRequests, items);
}

function getEquipment() {
  return readCollection<MockEquipment>(OFFLINE_STORAGE_KEYS.equipment);
}

function saveEquipment(items: MockEquipment[]) {
  writeCollection(OFFLINE_STORAGE_KEYS.equipment, items);
}

function sortNewestFirst(items: BorrowRequest[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const borrowRequestService = {
  async create(payload: {
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
    note?: string;
  }): Promise<ApiResponse<BorrowRequest>> {
    const requests = getRequests();
    const equipment = getEquipment().find((item) => item.id === payload.equipmentId);
    const createdAt = new Date().toISOString();
    const request: BorrowRequest = {
      id: nextId(requests),
      userId: MOCK_CURRENT_USER.id,
      equipmentId: payload.equipmentId,
      quantity: payload.quantity,
      status: 'pending',
      expectedReturnDate: payload.expectedReturnDate,
      note: payload.note,
      createdAt,
      updatedAt: createdAt,
      userFullName: MOCK_CURRENT_USER.fullName,
      userEmail: MOCK_CURRENT_USER.email,
      equipmentName: equipment?.name ?? `Thiet bi #${payload.equipmentId}`,
    };

    saveRequests([request, ...requests]);
    createNotification({
      userId: request.userId,
      type: 'new_request',
      title: 'Yêu cầu mới đã được tạo',
      message: `Yêu cầu mượn ${request.equipmentName} của bạn đang chờ duyệt.`,
      targetRole: 'student',
    });
    // Also notify admin about the new request
    createNotification({
      userId: 0,
      type: 'new_request',
      title: 'Yêu cầu mượn mới',
      message: `Sinh viên ${request.userFullName} đã gửi yêu cầu mượn ${request.equipmentName} (SL: ${request.quantity}).`,
      targetRole: 'admin',
    });

    return apiSuccess(request, 'Tao yeu cau thanh cong');
  },

  async listMy(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<BorrowRequest>>> {
    const items = sortNewestFirst(
      getRequests().filter((item) => item.userId === MOCK_CURRENT_USER.id),
    );
    return apiSuccess(paginate(items, params?.page ?? 1, params?.pageSize ?? 10));
  },

  async listAll(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<BorrowRequest>>> {
    const search = params?.search?.trim().toLowerCase();
    let items = getRequests();

    if (params?.status) {
      items = items.filter((item) => item.status === params.status);
    }
    if (search) {
      items = items.filter((item) => (
        item.userFullName?.toLowerCase().includes(search)
        || item.userEmail?.toLowerCase().includes(search)
        || item.equipmentName?.toLowerCase().includes(search)
      ));
    }

    return apiSuccess(paginate(sortNewestFirst(items), params?.page ?? 1, params?.pageSize ?? 15));
  },

  async cancel(id: number): Promise<ApiResponse<BorrowRequest>> {
    const updatedAt = new Date().toISOString();
    let updated: BorrowRequest | null = null;
    const items = getRequests().map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, status: 'cancelled', updatedAt };
      return updated;
    });

    saveRequests(items);
    if (updated) {
      createNotification({
        userId: updated.userId,
        type: 'rejected',
        title: 'Yêu cầu đã hủy',
        message: `Yêu cầu mượn ${updated.equipmentName} đã được hủy.`,
        targetRole: 'student',
      });
    }

    return apiSuccess(updated, updated ? 'Huy yeu cau thanh cong' : 'Khong tim thay yeu cau') as ApiResponse<BorrowRequest>;
  },

  async approve(id: number): Promise<ApiResponse<BorrowRequest>> {
    const updatedAt = new Date().toISOString();
    let updated: BorrowRequest | null = null;
    const items = getRequests().map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, status: 'approved', updatedAt };
      return updated;
    });

    saveRequests(items);
    if (updated) {
      const equipmentItems = getEquipment().map((equipment) => (
        equipment.id === updated!.equipmentId
          ? {
              ...equipment,
              availableQuantity: Math.max(0, equipment.availableQuantity - updated!.quantity),
            }
          : equipment
      ));
      saveEquipment(equipmentItems);
      createNotification({
        userId: updated.userId,
        type: 'approved',
        title: 'Yêu cầu đã được duyệt',
        message: `Yêu cầu mượn ${updated.equipmentName} đã được quản trị viên duyệt.`,
        targetRole: 'student',
      });
    }

    return apiSuccess(updated, updated ? 'Duyet yeu cau thanh cong' : 'Khong tim thay yeu cau') as ApiResponse<BorrowRequest>;
  },

  async reject(id: number, reason: string): Promise<ApiResponse<BorrowRequest>> {
    const updatedAt = new Date().toISOString();
    let updated: BorrowRequest | null = null;
    const items = getRequests().map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, status: 'rejected', rejectReason: reason, updatedAt };
      return updated;
    });

    saveRequests(items);
    if (updated) {
      createNotification({
        userId: updated.userId,
        type: 'rejected',
        title: 'Yêu cầu bị từ chối',
        message: `Yêu cầu mượn ${updated.equipmentName} bị từ chối. Lý do: ${reason}`,
        targetRole: 'student',
      });
    }

    return apiSuccess(updated, updated ? 'Tu choi yeu cau thanh cong' : 'Khong tim thay yeu cau') as ApiResponse<BorrowRequest>;
  },

  async remove(id: number): Promise<ApiResponse<{ id: number }>> {
    saveRequests(getRequests().filter((item) => item.id !== id));
    return apiSuccess({ id }, 'Xoa yeu cau thanh cong');
  },
};
