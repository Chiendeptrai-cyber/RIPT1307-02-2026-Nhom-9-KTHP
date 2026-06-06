/**
 * Overdue Check Job
 * ─────────────────
 * Chạy hàng ngày lúc 00:00 (midnight) để:
 *  1. Đánh dấu "overdue" cho các đơn "borrowing" đã quá hạn
 *  2. Gửi cảnh báo đỏ (notification + email) cho đơn quá hạn 1+ ngày
 */
import {
  borrowRequestRepo,
  notificationRepo,
  emailLogRepo,
} from '../container';
import { NodemailerEmailService } from '../services/nodemailer-email.service';
import {
  BorrowRequestStatus,
  NotificationType,
  EmailLogType,
  EmailSendStatus,
} from '@equipment-mgmt/shared';

const emailService = new NodemailerEmailService();

function buildOverdueEmail(params: {
  fullName: string;
  requestId: number;
  equipmentName: string;
  dueDate: string;
  daysOverdue: number;
}): { subject: string; html: string } {
  const { fullName, requestId, equipmentName, dueDate, daysOverdue } = params;

  const subject = `[PTIT Equipment] CẢNH BÁO: Bạn đang giữ quá hạn thiết bị ${daysOverdue} ngày`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #ff4d4f; border-radius: 8px;">
      <div style="text-align: center; border-bottom: 2px solid #bf0404; padding-bottom: 20px;">
        <h2 style="color: #bf0404; margin: 0;">⚠️ CẢNH BÁO QUÁ HẠN</h2>
        <p style="color: #ff4d4f; margin: 4px 0 0; font-weight: bold;">Thiết bị đang bị giữ quá hạn — Vui lòng trả ngay</p>
      </div>
      <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Bạn đang giữ quá hạn thiết bị <strong>${equipmentName}</strong> thuộc phiếu mượn <strong>#${requestId}</strong>.</p>
        <p>Hạn trả dự kiến: <strong>${dueDate}</strong> (đã quá hạn <strong style="color:#ff4d4f">${daysOverdue} ngày</strong>).</p>
        <div style="background: #fff1f0; border-left: 4px solid #ff4d4f; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; color: #cf1322; font-weight: bold;">
            ⚠️ Vui lòng mang thiết bị đến phòng quản lý để trả NGAY LẬP TỨC.
          </p>
          <p style="margin: 8px 0 0; color: #666; font-size: 13px;">
            Việc giữ quá hạn sẽ được ghi nhận vào hồ sơ vi phạm và có thể ảnh hưởng đến khả năng mượn thiết bị trong tương lai.
          </p>
        </div>
      </div>
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e4e4e4; color: #999; font-size: 12px;">
        <p>© PTIT Equipment Management System</p>
      </div>
    </div>
  `;

  return { subject, html };
}

export async function overdueCheckJob(): Promise<void> {
  try {
    console.log('[OverdueCheckJob] Starting...');

    // 1. Đánh dấu overdue cho các đơn borrowing quá hạn (auto-overdue, giống auto-cancel.job)
    const overdueBorrowing = await (borrowRequestRepo as any).findOverdueBorrowingRequests?.() ?? [];
    console.log(`[OverdueCheckJob] Found ${overdueBorrowing.length} borrowing requests now overdue`);

    for (const request of overdueBorrowing) {
      if (request.status === BorrowRequestStatus.BORROWING) {
        await borrowRequestRepo.update(request.id, { status: BorrowRequestStatus.OVERDUE });
        console.log(`[OverdueCheckJob] Marked overdue request #${request.id}`);
      }
    }

    // 2. Gửi cảnh báo cho đơn quá hạn 1+ ngày
    const overdueRequests = await borrowRequestRepo.findOverdueByDaysRequests(1);
    console.log(`[OverdueCheckJob] Found ${overdueRequests.length} requests overdue by 1+ day`);

    for (const request of overdueRequests) {
      const equipmentName = request.equipmentName ?? 'thiết bị';
      const dueDate = new Date(request.expectedReturnDate).toLocaleDateString('vi-VN');
      const daysOverdue = Math.floor(
        (Date.now() - new Date(request.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Đảm bảo status là overdue
      if (request.status === BorrowRequestStatus.BORROWING) {
        await borrowRequestRepo.update(request.id, { status: BorrowRequestStatus.OVERDUE });
      }

      // In-app notification — cảnh báo đỏ
      await notificationRepo.create({
        userId: request.userId,
        type: NotificationType.OVERDUE_ALERT,
        title: `⚠️ Bạn đang giữ quá hạn thiết bị`,
        message: `Bạn đang giữ quá hạn thiết bị "${equipmentName}" (phiếu #${request.id}) ${daysOverdue} ngày. Vui lòng trả ngay để tránh vi phạm.`,
        isRead: false,
      });

      // Email cảnh báo
      try {
        const { subject, html } = buildOverdueEmail({
          fullName: request.userFullName,
          requestId: request.id,
          equipmentName,
          dueDate,
          daysOverdue,
        });

        await emailService.sendMail({ to: request.userEmail, subject, html });

        await emailLogRepo.create({
          userId: request.userId,
          type: EmailLogType.OVERDUE_ALERT,
          status: EmailSendStatus.SENT,
          subject,
          recipient: request.userEmail,
          errorMessage: null,
        });
      } catch (emailErr) {
        console.error(`[OverdueCheckJob] Failed to send email for request #${request.id}:`, emailErr);
        await emailLogRepo.create({
          userId: request.userId,
          type: EmailLogType.OVERDUE_ALERT,
          status: EmailSendStatus.FAILED,
          subject: 'Overdue alert',
          recipient: request.userEmail,
          errorMessage: String(emailErr),
        });
      }
    }

    console.log('[OverdueCheckJob] Completed successfully');
  } catch (err) {
    console.error('[OverdueCheckJob] Error:', err);
  }
}
