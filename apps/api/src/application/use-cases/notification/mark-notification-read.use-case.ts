import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(id: number | 'all', userId: number) {
    if (id === 'all') {
      await (this.notificationRepo as any).markAllRead(userId);
      return { success: true };
    }

    const updated = await this.notificationRepo.markRead(id as number);
    if (!updated || updated.userId !== userId) {
      throw new AppError('Thông báo không tồn tại', 404, 'NOT_FOUND');
    }
    return updated;
  }
}
