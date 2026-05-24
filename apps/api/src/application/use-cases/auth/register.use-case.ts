import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { UserRole, UserStatus } from '@equipment-mgmt/shared';

export class RegisterUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ id: number; email: string; fullName: string; role: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email này đã được sử dụng');
    }

    // password sẽ được hash trong repository
    const user = await this.userRepo.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash: data.password,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
    });

    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }
}
