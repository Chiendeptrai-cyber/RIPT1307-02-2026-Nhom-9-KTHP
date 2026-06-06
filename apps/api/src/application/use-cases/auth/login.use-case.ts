import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { JwtTokenService } from '../../../infrastructure/services/jwt-token.service';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { UserStatus } from '@equipment-mgmt/shared';
import bcrypt from 'bcryptjs';

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: JwtTokenService,
  ) {}

  async execute(data: { email: string; password: string }): Promise<{ accessToken: string }> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    // Tài khoản bị khóa — trả về thông tin chi tiết để frontend hiển thị
    if (user.status === UserStatus.LOCKED) {
      // Lấy email admin đã khóa (nếu có)
      let adminEmail: string | null = null;
      if (user.lockedBy) {
        const admin = await this.userRepo.findById(user.lockedBy);
        adminEmail = admin?.email ?? null;
      }

      const error = new UnauthorizedError('ACCOUNT_LOCKED') as any;
      error.code = 'ACCOUNT_LOCKED';
      error.details = {
        lockedAt: user.lockedAt ?? null,
        lockReason: user.lockReason ?? null,
        adminEmail,
      };
      throw error;
    }

    const token = this.tokenService.sign({ userId: user.id, role: user.role });
    return { accessToken: token };
  }
}
