import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export class RejectBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(requestId: number, reason: string) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new AppError('Chỉ có thể từ chối yêu cầu đang ở trạng thái Chờ duyệt', 400, 'INVALID_STATUS');
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.REJECTED,
      note: reason,
    } as any);

    await this.notificationRepo.create({
      userId: request.userId,
      type: NotificationType.REJECTED,
      title: 'Yêu cầu mượn bị từ chối',
      message: `Yêu cầu mượn thiết bị của bạn đã bị từ chối. Lý do: ${reason}`,
      isRead: false,
    });

    return updated;
  }
}
