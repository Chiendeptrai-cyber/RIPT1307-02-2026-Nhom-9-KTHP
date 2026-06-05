import bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { AppError } from '../../../domain/errors/app.error';

export class ChangePasswordUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    userId: number;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    // 1. Get user with passwordHash
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không chính xác', 400, 'INVALID_PASSWORD');
    }

    // 3. Hash new password and save
    const newHash = await bcrypt.hash(data.newPassword, 10);
    await this.userRepo.update(data.userId, { passwordHash: newHash });
  }
}
