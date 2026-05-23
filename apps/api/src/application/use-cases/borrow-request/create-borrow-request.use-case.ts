import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';

export class CreateBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(data: { userId: number; expectedReturnDate: string; equipmentIds: number[] }) {
    const request = await this.borrowRequestRepo.create({
      userId: data.userId,
      status: 'pending',
      expectedReturnDate: data.expectedReturnDate,
    } as any);

    await this.notificationRepo.create({
      userId: data.userId,
      type: 'new_request',
      title: 'Borrow request created',
      message: 'Your borrow request has been created',
      isRead: false,
    } as any);

    return request;
  }
}
