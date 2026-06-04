import { randomUUID } from 'crypto';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { IPasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository';
import type { NodemailerEmailService } from '../../../infrastructure/services/nodemailer-email.service';
import { BadRequestError } from '../../../domain/errors/bad-request.error';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenRepo: IPasswordResetTokenRepository,
    private readonly emailService: NodemailerEmailService,
  ) {}

  async execute(data: { email: string }): Promise<{ resetToken: string; emailPreviewUrl?: string }> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new BadRequestError('Email không tồn tại trong hệ thống');
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    await this.tokenRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });

    console.log(`[PASSWORD RESET] Token generated for ${data.email}: ${token}`);

    let emailPreviewUrl: string | undefined;
    try {
      // Send real/mock email
      const resetLink = `http://localhost:8080/reset-password?token=${token}`;
      const mailInfo = await this.emailService.sendMail({
        to: data.email,
        subject: '[PTIT Equipment Management] Yêu cầu đặt lại mật khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #bf0404; padding-bottom: 20px;">
              <h2 style="color: #bf0404; margin: 0;">Quản Lý Thiết Bị PTIT</h2>
            </div>
            <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
              <p>Xin chào <strong>${user.fullName}</strong>,</p>
              <p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.</p>
              <p>Vui lòng nhấn vào nút dưới đây để đặt lại mật khẩu mới (Mã có hiệu lực trong vòng 1 giờ):</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #bf0404; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đổi Mật Khẩu Mới</a>
              </div>
              <p>Hoặc sao chép đường dẫn này dán vào trình duyệt:</p>
              <p style="word-break: break-all; color: #666666;"><a href="${resetLink}" style="color: #bf0404;">${resetLink}</a></p>
              <p>Mã token của bạn: <strong style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${token}</strong></p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email, mật khẩu của bạn sẽ không bị thay đổi.</p>
            </div>
            <div style="border-top: 1px solid #e4e4e4; padding-top: 15px; text-align: center; font-size: 12px; color: #888888;">
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
              <p>© Học viện Công nghệ Bưu chính Viễn thông - PTIT</p>
            </div>
          </div>
        `,
      });
      emailPreviewUrl = (mailInfo as any).previewUrl;
    } catch (error) {
      console.error('[PASSWORD RESET] Failed to send password reset email:', error);
    }

    return {
      resetToken: emailPreviewUrl ? token : '',
      emailPreviewUrl,
    };
  }
}
