import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { PaginatedResponse } from '@equipment-mgmt/shared';
import { UserRole, UserStatus } from '@equipment-mgmt/shared';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';

export class ListUsersUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    userId: number;
    userRole: UserRole;
    page: number;
    pageSize: number;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<PaginatedResponse<UserEntity>> {
    // Admin only
    if (data.userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Only admins can list users');
    }

    const { items, total } = await this.userRepo.findAll({
      page: data.page,
      pageSize: data.pageSize,
      role: data.role as string | undefined,
      status: data.status as string | undefined,
    });

    const totalPages = Math.ceil(total / data.pageSize);

    return {
      items,
      total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages,
    };
  }
}
