import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    userId: number;
    fullName?: string;
    email?: string;
  }): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updated = await this.userRepo.update(data.userId, {
      ...(data.fullName ? { fullName: data.fullName } : {}),
      ...(data.email ? { email: data.email } : {}),
    });

    const { passwordHash, ...result } = updated;
    return result;
  }
}
