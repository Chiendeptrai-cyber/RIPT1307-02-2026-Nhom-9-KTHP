import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export class ApproveBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(requestId: number) {
    const request = await this.borrowRequestRepo.findById(requestId);
    if (!request) throw new AppError('Yêu cầu mượn không tồn tại', 404, 'NOT_FOUND');
    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new AppError('Chỉ có thể duyệt yêu cầu đang ở trạng thái Chờ duyệt', 400, 'INVALID_STATUS');
    }

    const updated = await this.borrowRequestRepo.update(requestId, {
      status: BorrowRequestStatus.APPROVED,
    });

    await this.notificationRepo.create({
      userId: request.userId,
      type: NotificationType.APPROVED,
      title: 'Yêu cầu mượn đã được duyệt',
      message: 'Yêu cầu mượn thiết bị của bạn đã được phê duyệt. Vui lòng đến phòng thiết bị để nhận.',
      isRead: false,
    });

    return updated;
  }
}
