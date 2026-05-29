import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export class GetUserProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    userId: number;
  }): Promise<Omit<UserEntity, 'passwordHash'>> {
    // Get user by ID
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Return without passwordHash
    const { passwordHash, ...result } = user;
    return result;
  }
}
