import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { NodemailerEmailService } from '../../../infrastructure/services/nodemailer-email.service';
import { AppError } from '../../../domain/errors/app.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export class RejectBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly userRepo: IUserRepository,
    private readonly emailService: NodemailerEmailService,
  ) {}

  async execute(requestId: number, reason: string) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new AppError('Chỉ có thể từ chối yêu cầu đang ở trạng thái Chờ duyệt', 400, 'INVALID_STATUS');
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.REJECTED,
      note: reason,
    } as any);

    await this.notificationRepo.create({
      userId: request.userId,
      type: NotificationType.REJECTED,
      title: 'Yêu cầu mượn bị từ chối',
      message: `Yêu cầu mượn thiết bị của bạn đã bị từ chối. Lý do: ${reason}`,
      isRead: false,
    });

    // Gửi email thông báo cho sinh viên
    try {
      const student = await this.userRepo.findById(request.userId);
      if (student?.email) {
        await this.emailService.sendMail({
          to: student.email,
          subject: '[PTIT Equipment Management] Yêu cầu mượn thiết bị bị từ chối',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
              <div style="text-align: center; border-bottom: 2px solid #bf0404; padding-bottom: 20px;">
                <h2 style="color: #bf0404; margin: 0;">Quản Lý Thiết Bị PTIT</h2>
              </div>
              <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
                <p>Xin chào <strong>${student.fullName}</strong>,</p>
                <p>Yêu cầu mượn thiết bị <strong>#${requestId}</strong> của bạn đã bị <strong style="color: #ff4d4f;">TỪ CHỐI</strong>.</p>
                <div style="background-color: #fff2f0; border: 1px solid #ffccc7; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
                  <p style="margin: 0 0 6px 0; color: #ff4d4f; font-weight: bold;">❌ Lý do từ chối:</p>
                  <p style="margin: 0; color: #333;">${reason}</p>
                </div>
                <p>Nếu bạn có thắc mắc, vui lòng liên hệ trực tiếp với phòng quản lý thiết bị.</p>
              </div>
              <div style="border-top: 1px solid #e4e4e4; padding-top: 15px; text-align: center; font-size: 12px; color: #888888;">
                <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                <p>© Học viện Công nghệ Bưu chính Viễn thông - PTIT</p>
              </div>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error('[REJECT] Failed to send rejection email:', err);
    }

    return updated;
  }
}
