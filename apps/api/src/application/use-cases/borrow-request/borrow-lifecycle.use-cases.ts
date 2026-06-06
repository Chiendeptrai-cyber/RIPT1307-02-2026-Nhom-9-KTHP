import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { IStockLogRepository } from '../../../domain/repositories/stock-log.repository';
import type { IViolationRepository } from '../../../domain/repositories/violation.repository';
import type { NodemailerEmailService } from '../../../infrastructure/services/nodemailer-email.service';
import { AppError } from '../../../domain/errors/app.error';
import { BorrowRequestStatus, NotificationType, StockActionType, ViolationType } from '@equipment-mgmt/shared';

/**
 * MarkReceived: Admin xác nhận sinh viên đã đến nhận thiết bị.
 * approved → borrowing
 */
export class MarkReceivedUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly userRepo: IUserRepository,
    private readonly emailService: NodemailerEmailService,
  ) {}

  async execute(requestId: number) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (request.status !== BorrowRequestStatus.APPROVED) {
      throw new AppError('Chỉ có thể xác nhận nhận khi đơn ở trạng thái Đã duyệt', 400, 'INVALID_STATUS');
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.BORROWING,
      borrowedAt: new Date().toISOString(),
      borrowStartDate: new Date().toISOString(),
    } as any);

    await this.notificationRepo.create({
      userId: request.userId,
      type: NotificationType.CHECKOUT_CONFIRMED,
      title: 'Bạn đã nhận thiết bị thành công',
      message: `Thiết bị đã được xác nhận giao thành công. Vui lòng trả đúng hạn.`,
      isRead: false,
    });

    try {
      const student = await this.userRepo.findById(request.userId);
      if (student?.email) {
        await this.emailService.sendMail({
          to: student.email,
          subject: '[PTIT Equipment Management] Xác nhận nhận thiết bị',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
              <div style="text-align: center; border-bottom: 2px solid #bf0404; padding-bottom: 20px;">
                <h2 style="color: #bf0404; margin: 0;">Quản Lý Thiết Bị PTIT</h2>
              </div>
              <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
                <p>Xin chào <strong>${student.fullName}</strong>,</p>
                <p>Thiết bị thuộc phiếu mượn <strong>#${requestId}</strong> đã được xác nhận <strong style="color: #1890ff;">GIAO THÀNH CÔNG</strong>.</p>
                <p>Vui lòng trả thiết bị đúng thời hạn để tránh vi phạm.</p>
              </div>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error('[MARK_RECEIVED] Failed to send email:', err);
    }

    return updated;
  }
}

/**
 * MarkNotReceived: Admin xác nhận sinh viên không đến nhận.
 * approved → cancelled (lý do: Sinh viên không đến nhận)
 */
export class MarkNotReceivedUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly stockLogRepo: IStockLogRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(requestId: number) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (request.status !== BorrowRequestStatus.APPROVED) {
      throw new AppError('Chỉ có thể hủy khi đơn ở trạng thái Đã duyệt', 400, 'INVALID_STATUS');
    }

    // Hoàn trả số lượng thiết bị vào kho
    const items = await this.borrowRequestRepo.getItems(requestId);
    for (const item of items) {
      await this.equipmentRepo.incrementAvailable(item.equipmentId, item.quantity);
      await this.stockLogRepo.create({
        equipmentId: item.equipmentId,
        action: StockActionType.BORROW_CANCEL,
        quantity: item.quantity,
        note: `Hủy phiếu mượn #${requestId} — Sinh viên không đến nhận`,
      });
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.CANCELLED,
      rejectReason: 'Sinh viên không đến nhận thiết bị trong thời hạn 3 ngày',
    } as any);

    await this.notificationRepo.create({
      userId: request.userId,
      type: NotificationType.REJECTED,
      title: 'Phiếu mượn bị hủy',
      message: `Phiếu mượn #${requestId} đã bị hủy do bạn không đến nhận thiết bị trong thời hạn 3 ngày.`,
      isRead: false,
    });

    return updated;
  }
}

/**
 * MarkReturned: Admin xác nhận sinh viên đã trả thiết bị.
 * borrowing / overdue → returned
 */
export class MarkReturnedUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly stockLogRepo: IStockLogRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly userRepo: IUserRepository,
    private readonly violationRepo: IViolationRepository,
    private readonly emailService: NodemailerEmailService,
  ) {}

  async execute(requestId: number) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (
      request.status !== BorrowRequestStatus.BORROWING &&
      request.status !== BorrowRequestStatus.OVERDUE
    ) {
      throw new AppError('Chỉ có thể xác nhận trả khi đơn đang mượn hoặc quá hạn', 400, 'INVALID_STATUS');
    }

    const returnedAt = new Date();

    // Tính on-time dựa trên MAX expected_return_date của tất cả items
    const items = await this.borrowRequestRepo.getItems(requestId);
    const maxExpectedDate = items.reduce((max, item) => {
      const d = new Date(item.expectedReturnDate);
      return d > max ? d : max;
    }, new Date(0));
    const isOnTime = returnedAt <= maxExpectedDate;

    // Hoàn trả số lượng thiết bị vào kho
    for (const item of items) {
      await this.equipmentRepo.incrementAvailable(item.equipmentId, item.quantity);
      await this.stockLogRepo.create({
        equipmentId: item.equipmentId,
        action: StockActionType.BORROW_RETURN,
        quantity: item.quantity,
        note: `Nhận lại từ phiếu mượn #${requestId} — ${isOnTime ? 'Trả đúng hạn' : 'Trả không đúng hạn'}`,
      });
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.RETURNED,
      returnedAt: returnedAt.toISOString(),
    } as any);

    if (!isOnTime) {
      await this.violationRepo.create({
        userId: request.userId,
        borrowRequestId: requestId,
        type: ViolationType.LATE_RETURN,
        description: `Trả thiết bị muộn. Hạn trả: ${expectedReturnDate.toLocaleDateString('vi-VN')}, Ngày trả thực tế: ${returnedAt.toLocaleDateString('vi-VN')}`,
      });
    }

    await this.notificationRepo.create({
      userId: request.userId,
      type: NotificationType.RETURN_CONFIRMED,
      title: 'Đã trả thiết bị thành công',
      message: isOnTime
        ? `Phiếu mượn #${requestId} đã được ghi nhận trả đúng hạn. Cảm ơn bạn!`
        : `Phiếu mượn #${requestId} đã được ghi nhận trả không đúng hạn.`,
      isRead: false,
    });

    try {
      const student = await this.userRepo.findById(request.userId);
      if (student?.email) {
        await this.emailService.sendMail({
          to: student.email,
          subject: '[PTIT Equipment Management] Xác nhận trả thiết bị',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
              <div style="text-align: center; border-bottom: 2px solid #bf0404; padding-bottom: 20px;">
                <h2 style="color: #bf0404; margin: 0;">Quản Lý Thiết Bị PTIT</h2>
              </div>
              <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
                <p>Xin chào <strong>${student.fullName}</strong>,</p>
                <p>Phiếu mượn <strong>#${requestId}</strong> đã được ghi nhận <strong style="color: ${isOnTime ? '#52c41a' : '#ff4d4f'};">${isOnTime ? 'TRẢ ĐÚNG HẠN ✅' : 'TRẢ KHÔNG ĐÚNG HẠN ❌'}</strong>.</p>
              </div>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error('[MARK_RETURNED] Failed to send email:', err);
    }

    return { ...updated, isOnTime };
  }
}
