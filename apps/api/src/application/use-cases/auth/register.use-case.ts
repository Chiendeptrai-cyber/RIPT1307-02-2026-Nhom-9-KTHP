import type { IUserRepository } from '../../../domain/repositories/user.repository';
import bcrypt from 'bcryptjs';

export class RegisterUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: { fullName: string; email: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.userRepo.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: 'student',
      status: 'active',
    } as any);
  }
}
