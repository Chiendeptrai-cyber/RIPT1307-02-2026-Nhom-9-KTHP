import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { IBorrowRecordRepository } from '../../../domain/repositories/borrow-record.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { IViolationRepository } from '../../../domain/repositories/violation.repository';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { UserRole } from '@equipment-mgmt/shared';

export class GetDashboardStatsUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly borrowRecordRepo: IBorrowRecordRepository,
    private readonly userRepo: IUserRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly violationRepo: IViolationRepository,
  ) {}

  async execute(data: { userRole: UserRole }) {
    if (data.userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Only admins can access dashboard stats');
    }

    const pendingRequests = await this.borrowRequestRepo.countByStatus('pending');
    const overdueItems = await this.borrowRecordRepo.countOverdue();
    const violationCount = await this.violationRepo.countAll();
    const totalUsers = await this.userRepo.countAll();
    const totalEquipment = await this.equipmentRepo.countAll();
    const totalBorrowed = await this.borrowRecordRepo.countAll();

    return {
      pendingRequests,
      overdueItems,
      violationCount,
      totalUsers,
      totalEquipment,
      totalBorrowed,
    };
  }
}
