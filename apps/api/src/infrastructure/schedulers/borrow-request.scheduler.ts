/**
 * Borrow Request Scheduler
 * ─────────────────────────
 * Chạy định kỳ để:
 *  1. Tự hủy đơn "approved" sau 3 ngày không đến nhận
 *  2. Tự đánh dấu "overdue" đơn "borrowing" đã quá hạn trả
 */

import type { IBorrowRequestRepository } from '../../domain/repositories/borrow-request.repository';
import type { IEquipmentRepository } from '../../domain/repositories/equipment.repository';
import type { IStockLogRepository } from '../../domain/repositories/stock-log.repository';
import type { INotificationRepository } from '../../domain/repositories/notification.repository';
import { BorrowRequestStatus, StockActionType, NotificationType } from '@equipment-mgmt/shared';

export class BorrowRequestScheduler {
  private autoCancelTimer?: ReturnType<typeof setInterval>;
  private autoOverdueTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly stockLogRepo: IStockLogRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  start(): void {
    // Chạy ngay khi khởi động, sau đó mỗi 1 giờ
    this.runAutoCancel();
    this.runAutoOverdue();

    this.autoCancelTimer = setInterval(() => this.runAutoCancel(), 60 * 60 * 1000);
    this.autoOverdueTimer = setInterval(() => this.runAutoOverdue(), 60 * 60 * 1000);

    console.log('[Scheduler] BorrowRequestScheduler started (auto-cancel + auto-overdue)');
  }

  stop(): void {
    if (this.autoCancelTimer) clearInterval(this.autoCancelTimer);
    if (this.autoOverdueTimer) clearInterval(this.autoOverdueTimer);
    console.log('[Scheduler] BorrowRequestScheduler stopped');
  }

  /** Hủy đơn "approved" đã quá 3 ngày chưa đến nhận */
  private async runAutoCancel(): Promise<void> {
    try {
      const expiredRequests = await (this.borrowRequestRepo as any).findExpiredApprovedRequests?.() ?? [];
      for (const request of expiredRequests) {
        // Hoàn trả kho
        const items = await this.borrowRequestRepo.getItems(request.id);
        for (const item of items) {
          await this.equipmentRepo.incrementAvailable(item.equipmentId, item.quantity);
          await this.stockLogRepo.create({
            equipmentId: item.equipmentId,
            action: StockActionType.BORROW_CANCEL,
            quantity: item.quantity,
            note: `Auto-hủy phiếu mượn #${request.id} — Sinh viên không đến nhận sau 3 ngày`,
          });
        }

        await this.borrowRequestRepo.update(request.id, {
          status: BorrowRequestStatus.CANCELLED,
          rejectReason: 'Tự động hủy: Sinh viên không đến nhận thiết bị trong thời hạn 3 ngày',
        } as any);

        await this.notificationRepo.create({
          userId: request.userId,
          type: NotificationType.REJECTED,
          title: 'Phiếu mượn đã bị hủy tự động',
          message: `Phiếu mượn #${request.id} đã bị hủy tự động do bạn không đến nhận thiết bị trong thời hạn 3 ngày kể từ ngày duyệt.`,
          isRead: false,
        });

        console.log(`[Scheduler] Auto-cancelled request #${request.id} (approved > 3 days, not picked up)`);
      }
    } catch (err) {
      console.error('[Scheduler] runAutoCancel error:', err);
    }
  }

  /** Đánh dấu "overdue" cho đơn "borrowing" đã quá hạn trả */
  private async runAutoOverdue(): Promise<void> {
    try {
      const overdueRequests = await (this.borrowRequestRepo as any).findOverdueBorrowingRequests?.() ?? [];
      for (const request of overdueRequests) {
        await this.borrowRequestRepo.update(request.id, {
          status: BorrowRequestStatus.OVERDUE,
        });

        await this.notificationRepo.create({
          userId: request.userId,
          type: NotificationType.OVERDUE_ALERT,
          title: '⚠️ Thiết bị quá hạn trả!',
          message: `Phiếu mượn #${request.id} đã quá hạn trả. Vui lòng trả thiết bị ngay để tránh vi phạm.`,
          isRead: false,
        });

        console.log(`[Scheduler] Auto-marked overdue request #${request.id}`);
      }
    } catch (err) {
      console.error('[Scheduler] runAutoOverdue error:', err);
    }
  }
}
