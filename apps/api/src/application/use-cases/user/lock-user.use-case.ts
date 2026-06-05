import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import { UserRole, UserStatus } from '@equipment-mgmt/shared';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export class LockUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    adminId: number;
    adminRole: UserRole;
    targetUserId: number;
    newStatus: UserStatus;
  }): Promise<Omit<UserEntity, 'passwordHash'>> {
    // Admin only
    if (data.adminRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Only admins can lock/unlock users');
    }

    // Cannot lock self
    if (data.adminId === data.targetUserId) {
      throw new ForbiddenError('You cannot change your own status');
    }

    // Check user exists
    const user = await this.userRepo.findById(data.targetUserId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Only allow changing to LOCKED or BORROW_BLOCKED status
    if (![UserStatus.LOCKED, UserStatus.BORROW_BLOCKED, UserStatus.ACTIVE].includes(data.newStatus)) {
      throw new ForbiddenError('Invalid status for this operation');
    }

    // Update user status
    const updated = await this.userRepo.update(data.targetUserId, {
      status: data.newStatus,
    });

    // Return without passwordHash
    const { passwordHash, ...result } = updated;
    return result;
  }
}
