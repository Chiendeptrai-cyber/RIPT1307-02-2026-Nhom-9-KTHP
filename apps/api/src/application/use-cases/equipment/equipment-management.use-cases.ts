import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { IStockLogRepository } from '../../../domain/repositories/stock-log.repository';
import { AppError } from '../../../domain/errors/app.error';
import { StockActionType } from '@equipment-mgmt/shared';

/** Loại thao tác điều chỉnh kho */
export type StockAdjustmentType = 'import' | 'mark_damaged' | 'mark_lost' | 'adjustment';

export class StockAdjustmentUseCase {
  constructor(
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly stockLogRepo: IStockLogRepository,
    private readonly borrowRequestRepo: IBorrowRequestRepository,
  ) {}

  async execute(data: {
    equipmentId: number;
    type: StockAdjustmentType;
    quantity: number;
    note?: string;
    // chỉ dùng cho 'adjustment'
    newTotalQuantity?: number;
    newAvailableQuantity?: number;
    reason?: string;
  }): Promise<{ equipment: any }> {
    const eq = await this.equipmentRepo.findById(data.equipmentId);
    if (!eq) throw new AppError('Thiết bị không tồn tại', 404, 'NOT_FOUND');
    if (data.quantity !== undefined && data.quantity <= 0 && data.type !== 'adjustment') {
      throw new AppError('Số lượng phải lớn hơn 0', 400, 'INVALID_QUANTITY');
    }

    switch (data.type) {
      case 'import': {
        // Nhập thêm: tăng tổng và sẵn sàng
        const updated = await this.equipmentRepo.update(data.equipmentId, {
          totalQuantity: eq.totalQuantity + data.quantity,
          availableQuantity: eq.availableQuantity + data.quantity,
        });
        await this.stockLogRepo.create({
          equipmentId: data.equipmentId,
          action: StockActionType.IMPORT,
          quantity: data.quantity,
          note: data.note ?? `Nhập thêm ${data.quantity} thiết bị`,
        });
        return { equipment: updated };
      }

      case 'mark_damaged': {
        // Ghi nhận hỏng: giảm sẵn sàng, tổng không đổi
        if (data.quantity > eq.availableQuantity) {
          throw new AppError(
            `Chỉ có ${eq.availableQuantity} thiết bị sẵn sàng, không thể ghi nhận hỏng ${data.quantity} chiếc`,
            400, 'INSUFFICIENT_STOCK',
          );
        }
        const updated = await this.equipmentRepo.update(data.equipmentId, {
          availableQuantity: eq.availableQuantity - data.quantity,
        });
        await this.stockLogRepo.create({
          equipmentId: data.equipmentId,
          action: StockActionType.MARK_DAMAGED,
          quantity: data.quantity,
          note: data.note ?? `Ghi nhận ${data.quantity} thiết bị hỏng`,
        });
        return { equipment: updated };
      }

      case 'mark_lost': {
        // Ghi nhận mất: giảm tổng, sẵn sàng không đổi (mất = không còn tồn tại)
        if (data.quantity > eq.availableQuantity) {
          throw new AppError(
            `Chỉ có ${eq.availableQuantity} thiết bị sẵn sàng, không thể ghi nhận mất ${data.quantity} chiếc`,
            400, 'INSUFFICIENT_STOCK',
          );
        }
        const updated = await this.equipmentRepo.update(data.equipmentId, {
          totalQuantity: eq.totalQuantity - data.quantity,
          availableQuantity: eq.availableQuantity - data.quantity,
        });
        await this.stockLogRepo.create({
          equipmentId: data.equipmentId,
          action: StockActionType.MARK_LOST,
          quantity: data.quantity,
          note: data.note ?? `Ghi nhận ${data.quantity} thiết bị mất`,
        });
        return { equipment: updated };
      }

      case 'adjustment': {
        // Điều chỉnh trực tiếp
        if (!data.reason?.trim()) {
          throw new AppError('Lý do điều chỉnh là bắt buộc', 400, 'REASON_REQUIRED');
        }
        const newTotal = data.newTotalQuantity ?? eq.totalQuantity;
        const newAvail = data.newAvailableQuantity ?? eq.availableQuantity;

        if (newAvail < 0 || newAvail > newTotal) {
          throw new AppError(
            `Số lượng sẵn sàng (${newAvail}) phải ≥ 0 và ≤ tổng (${newTotal})`,
            400, 'INVALID_QUANTITY',
          );
        }

        // Kiểm tra số đang lưu hành (totalQuantity - availableQuantity)
        const currentBorrowed = eq.totalQuantity - eq.availableQuantity;
        if (newTotal < currentBorrowed) {
          throw new AppError(
            `Không thể đặt tổng số lượng thấp hơn số đang mượn (${currentBorrowed} chiếc)`,
            400, 'INVALID_QUANTITY',
          );
        }

        const updated = await this.equipmentRepo.update(data.equipmentId, {
          totalQuantity: newTotal,
          availableQuantity: newAvail,
        });
        await this.stockLogRepo.create({
          equipmentId: data.equipmentId,
          action: StockActionType.ADJUSTMENT,
          quantity: newTotal - eq.totalQuantity,
          note: `Điều chỉnh trực tiếp: Tổng ${eq.totalQuantity}→${newTotal}, Sẵn sàng ${eq.availableQuantity}→${newAvail}. Lý do: ${data.reason}`,
        });
        return { equipment: updated };
      }

      default:
        throw new AppError('Loại điều chỉnh không hợp lệ', 400, 'INVALID_TYPE');
    }
  }
}

/** Chuyển trạng thái thiết bị với kiểm tra ràng buộc */
export class ChangeEquipmentStatusUseCase {
  constructor(
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly borrowRequestRepo: IBorrowRequestRepository,
  ) {}

  // Cho phép chuyển trạng thái hợp lệ
  private readonly ALLOWED_TRANSITIONS: Record<string, string[]> = {
    active:            ['under_maintenance', 'damaged'],
    under_maintenance: ['active', 'discontinued'],
    damaged:           ['under_maintenance', 'discontinued'],
  };

  async execute(id: number, newStatus: string): Promise<any> {
    const eq = await this.equipmentRepo.findById(id);
    if (!eq) throw new AppError('Thiết bị không tồn tại', 404, 'NOT_FOUND');

    const allowed = this.ALLOWED_TRANSITIONS[eq.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Không thể chuyển từ "${eq.status}" sang "${newStatus}"`,
        400, 'INVALID_TRANSITION',
      );
    }

    // Nếu chuyển sang ngừng sử dụng: kiểm tra phiếu active
    if (newStatus === 'discontinued') {
      const activeStatuses = ['pending', 'approved', 'borrowing'];
      for (const status of activeStatuses) {
        const count = await (this.borrowRequestRepo as any).countByStatusAndEquipment?.(id, status)
          ?? await this.borrowRequestRepo.countByStatus(status);
        // chỉ block nếu có phiếu liên quan — kiểm tra đơn giản qua countByStatus
        // (nếu muốn chính xác hơn cần thêm query theo equipment_id)
      }
      // Block nếu có bất kỳ phiếu mượn đang mở nào
      const activeCount = await (this.borrowRequestRepo as any).countActiveByEquipment?.(id);
      if (activeCount && activeCount > 0) {
        throw new AppError(
          `Không thể ngừng sử dụng: còn ${activeCount} phiếu mượn đang mở liên quan đến thiết bị này`,
          400, 'HAS_ACTIVE_REQUESTS',
        );
      }
    }

    return this.equipmentRepo.update(id, { status: newStatus as any });
  }
}

/** Xóa thiết bị với validation phiếu active */
export class DeleteEquipmentWithValidationUseCase {
  constructor(
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly borrowRequestRepo: IBorrowRequestRepository,
  ) {}

  async execute(id: number): Promise<{ id: number }> {
    const eq = await this.equipmentRepo.findById(id);
    if (!eq) throw new AppError('Thiết bị không tồn tại', 404, 'NOT_FOUND');

    // Kiểm tra phiếu đang active (Đã duyệt hoặc Đang mượn)
    const activeCount = await (this.borrowRequestRepo as any).countActiveByEquipment?.(id) ?? 0;
    if (activeCount > 0) {
      throw new AppError(
        `Không thể xóa: còn ${activeCount} phiếu mượn đang active (Đã duyệt / Đang mượn). Vui lòng xử lý hết phiếu trước.`,
        400, 'HAS_ACTIVE_REQUESTS',
      );
    }

    await this.equipmentRepo.update(id, { status: 'deleted' as any });
    return { id };
  }
}
