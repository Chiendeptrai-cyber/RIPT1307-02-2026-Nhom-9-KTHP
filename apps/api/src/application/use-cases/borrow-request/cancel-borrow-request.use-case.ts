import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export class CancelBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(requestId: number, userId: number) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (request.userId !== userId) {
      throw new AppError('Bạn không có quyền hủy yêu cầu này', 403, 'FORBIDDEN');
    }
    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new AppError('Chỉ có thể hủy yêu cầu đang ở trạng thái Chờ duyệt', 400, 'INVALID_STATUS');
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.CANCELLED,
    });

    return updated;
  }
}
