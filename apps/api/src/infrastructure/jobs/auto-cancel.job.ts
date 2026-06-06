/**
 * Auto-cancel job: hủy đơn "approved" quá 3 ngày chưa đến nhận
 * và đánh dấu overdue cho đơn "borrowing" đã quá hạn trả.
 */
import { borrowRequestRepo, equipmentRepo, stockLogRepo, notificationRepo } from '../container';
import { BorrowRequestStatus, StockActionType, NotificationType } from '@equipment-mgmt/shared';

export async function autoCancelJob(): Promise<void> {
  try {
    // 1. Auto-cancel approved > 3 ngày
    const expired = await (borrowRequestRepo as any).findExpiredApprovedRequests?.() ?? [];
    for (const request of expired) {
      const items = await borrowRequestRepo.getItems(request.id);
      for (const item of items) {
        await equipmentRepo.incrementAvailable(item.equipmentId, item.quantity);
        await stockLogRepo.create({
          equipmentId: item.equipmentId,
          action: StockActionType.BORROW_CANCEL,
          quantity: item.quantity,
          note: `Auto-hủy phiếu mượn #${request.id} — Sinh viên không đến nhận sau 3 ngày`,
        });
      }
      await borrowRequestRepo.update(request.id, {
        status: BorrowRequestStatus.CANCELLED,
        rejectReason: 'Tự động hủy: Sinh viên không đến nhận thiết bị trong thời hạn 3 ngày',
      } as any);
      await notificationRepo.create({
        userId: request.userId,
        type: NotificationType.REJECTED,
        title: 'Phiếu mượn đã bị hủy tự động',
        message: `Phiếu mượn #${request.id} bị hủy tự động do không đến nhận trong 3 ngày.`,
        isRead: false,
      });
      console.log(`[AutoCancel] Cancelled request #${request.id}`);
    }

    // 2. Auto-overdue borrowing đã quá hạn trả
    const overdue = await (borrowRequestRepo as any).findOverdueBorrowingRequests?.() ?? [];
    for (const request of overdue) {
      await borrowRequestRepo.update(request.id, { status: BorrowRequestStatus.OVERDUE });
      await notificationRepo.create({
        userId: request.userId,
        type: NotificationType.OVERDUE_ALERT,
        title: '⚠️ Thiết bị quá hạn trả!',
        message: `Phiếu mượn #${request.id} đã quá hạn trả. Vui lòng trả thiết bị ngay.`,
        isRead: false,
      });
      console.log(`[AutoOverdue] Marked overdue request #${request.id}`);
    }
  } catch (err) {
    console.error('[AutoCancelJob] Error:', err);
  }
}
