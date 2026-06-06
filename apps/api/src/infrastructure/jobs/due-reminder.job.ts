/**
 * Due Reminder Job
 * ─────────────────
 * Chạy hàng ngày lúc 8:00 sáng để nhắc nhở sinh viên về thiết bị sắp đến hạn / đến hạn hôm nay.
 *  - Trước 3 ngày: notification + email "sắp đến hạn"
 *  - Ngày đến hạn: notification + email "hôm nay là hạn cuối"
 */
import {
  borrowRequestRepo,
  notificationRepo,
  emailLogRepo,
} from '../container';
import { NodemailerEmailService } from '../services/nodemailer-email.service';
import { NotificationType, EmailLogType, EmailSendStatus } from '@equipment-mgmt/shared';

const emailService = new NodemailerEmailService();

function buildDueReminderEmail(params: {
  fullName: string;
  requestId: number;
  equipmentName: string;
  dueDate: string;
  daysLeft: number;
}): { subject: string; html: string } {
  const { fullName, requestId, equipmentName, dueDate, daysLeft } = params;

  const urgencyColor = daysLeft <= 0 ? '#ff4d4f' : '#faad14';
  const urgencyText =
    daysLeft > 0
      ? `Thiết bị <strong>${equipmentName}</strong> thuộc phiếu mượn <strong>#${requestId}</strong> sẽ đến hạn trả vào <strong>${dueDate}</strong> (còn <strong>${daysLeft} ngày</strong>).`
      : `<strong style="color:#ff4d4f">Hôm nay là hạn cuối</strong> trả thiết bị <strong>${equipmentName}</strong> thuộc phiếu mượn <strong>#${requestId}</strong>.`;

  const subject =
    daysLeft > 0
      ? `[PTIT Equipment] Nhắc nhở: Thiết bị sắp đến hạn trả (còn ${daysLeft} ngày)`
      : '[PTIT Equipment] Hôm nay là hạn cuối trả thiết bị';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
      <div style="text-align: center; border-bottom: 2px solid #bf0404; padding-bottom: 20px;">
        <h2 style="color: #bf0404; margin: 0;">Quản Lý Thiết Bị PTIT</h2>
        <p style="color: #666; margin: 4px 0 0;">Nhắc nhở hạn trả thiết bị</p>
      </div>
      <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>${urgencyText}</p>
        <p style="background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 12px 16px; margin: 16px 0;">
          Vui lòng mang thiết bị đến phòng quản lý để trả đúng thời hạn, tránh bị ghi nhận vi phạm.
        </p>
        <p style="color: #666; font-size: 13px;">Nếu bạn đã trả thiết bị, vui lòng bỏ qua email này.</p>
      </div>
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e4e4e4; color: #999; font-size: 12px;">
        <p>© PTIT Equipment Management System</p>
      </div>
    </div>
  `;

  return { subject, html };
}

export async function dueReminderJob(): Promise<void> {
  try {
    console.log('[DueReminderJob] Starting...');

    // 1. Trước 3 ngày — gửi nhắc nhở
    const dueSoonRequests = await borrowRequestRepo.findDueSoonRequests(3);
    console.log(`[DueReminderJob] Found ${dueSoonRequests.length} requests due in 3 days`);

    for (const request of dueSoonRequests) {
      const equipmentName = request.equipmentName ?? 'thiết bị';
      const dueDate = new Date(request.expectedReturnDate).toLocaleDateString('vi-VN');

      // In-app notification
      await notificationRepo.create({
        userId: request.userId,
        type: NotificationType.DUE_REMINDER,
        title: `Thiết bị sắp đến hạn trả (còn 3 ngày)`,
        message: `Thiết bị "${equipmentName}" (phiếu #${request.id}) sẽ đến hạn trả vào ${dueDate}. Vui lòng trả đúng hạn.`,
        isRead: false,
      });

      // Email
      try {
        const { subject, html } = buildDueReminderEmail({
          fullName: request.userFullName,
          requestId: request.id,
          equipmentName,
          dueDate,
          daysLeft: 3,
        });

        await emailService.sendMail({ to: request.userEmail, subject, html });

        await emailLogRepo.create({
          userId: request.userId,
          type: EmailLogType.DUE_REMINDER,
          status: EmailSendStatus.SENT,
          subject,
          recipient: request.userEmail,
          errorMessage: null,
        });
      } catch (emailErr) {
        console.error(`[DueReminderJob] Failed to send email for request #${request.id}:`, emailErr);
        await emailLogRepo.create({
          userId: request.userId,
          type: EmailLogType.DUE_REMINDER,
          status: EmailSendStatus.FAILED,
          subject: 'Due reminder',
          recipient: request.userEmail,
          errorMessage: String(emailErr),
        });
      }
    }

    // 2. Hôm nay là hạn cuối
    const dueTodayRequests = await borrowRequestRepo.findDueTodayRequests();
    console.log(`[DueReminderJob] Found ${dueTodayRequests.length} requests due today`);

    for (const request of dueTodayRequests) {
      const equipmentName = request.equipmentName ?? 'thiết bị';
      const dueDate = new Date(request.expectedReturnDate).toLocaleDateString('vi-VN');

      // In-app notification
      await notificationRepo.create({
        userId: request.userId,
        type: NotificationType.DUE_REMINDER,
        title: `Hôm nay là hạn cuối trả thiết bị`,
        message: `Hôm nay là hạn cuối trả thiết bị "${equipmentName}" (phiếu #${request.id}). Vui lòng trả ngay hôm nay.`,
        isRead: false,
      });

      // Email
      try {
        const { subject, html } = buildDueReminderEmail({
          fullName: request.userFullName,
          requestId: request.id,
          equipmentName,
          dueDate,
          daysLeft: 0,
        });

        await emailService.sendMail({ to: request.userEmail, subject, html });

        await emailLogRepo.create({
          userId: request.userId,
          type: EmailLogType.DUE_REMINDER,
          status: EmailSendStatus.SENT,
          subject,
          recipient: request.userEmail,
          errorMessage: null,
        });
      } catch (emailErr) {
        console.error(`[DueReminderJob] Failed to send email for request #${request.id}:`, emailErr);
        await emailLogRepo.create({
          userId: request.userId,
          type: EmailLogType.DUE_REMINDER,
          status: EmailSendStatus.FAILED,
          subject: 'Due today reminder',
          recipient: request.userEmail,
          errorMessage: String(emailErr),
        });
      }
    }

    console.log('[DueReminderJob] Completed successfully');
  } catch (err) {
    console.error('[DueReminderJob] Error:', err);
  }
}
