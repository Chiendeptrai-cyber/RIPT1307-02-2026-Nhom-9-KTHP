import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { BadRequestError } from '../../../domain/errors/bad-request.error';

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    userId: number;
    fullName?: string;
    email?: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
  }): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (data.phoneNumber) {
      if (!/^\d{10}$/.test(data.phoneNumber)) {
        throw new BadRequestError('Số điện thoại phải chứa đúng 10 chữ số');
      }
    }

    const updated = await this.userRepo.update(data.userId, {
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
    });

    const { passwordHash, ...result } = updated;
    return result;
  }
}
