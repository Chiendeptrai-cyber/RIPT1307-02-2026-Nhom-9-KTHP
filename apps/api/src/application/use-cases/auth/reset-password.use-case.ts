import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { IPasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository';
import { BadRequestError } from '../../../domain/errors/bad-request.error';
import bcrypt from 'bcryptjs';

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenRepo: IPasswordResetTokenRepository,
  ) {}

  async execute(data: { token: string; passwordStr: string }): Promise<void> {
    const tokenRecord = await this.tokenRepo.findByToken(data.token);
    if (!tokenRecord) {
      throw new BadRequestError('Mã xác thực không hợp lệ');
    }

    if (tokenRecord.used) {
      throw new BadRequestError('Mã xác thực đã được sử dụng');
    }

    const now = new Date();
    if (new Date(tokenRecord.expiresAt) < now) {
      throw new BadRequestError('Mã xác thực đã hết hạn');
    }

    const user = await this.userRepo.findById(tokenRecord.userId);
    if (!user) {
      throw new BadRequestError('Không tìm thấy người dùng tương ứng');
    }

    // Hash new password
    const hashed = await bcrypt.hash(data.passwordStr, 10);

    // Update user password
    await this.userRepo.update(user.id, { passwordHash: hashed });

    // Mark token as used
    await this.tokenRepo.markAsUsed(data.token);

    console.log(`[PASSWORD RESET] Password successfully reset for user ${user.email}`);
  }
}
