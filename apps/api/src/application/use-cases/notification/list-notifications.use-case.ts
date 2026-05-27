import type { INotificationRepository } from '../../../domain/repositories/notification.repository';

export class ListNotificationsUseCase {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(userId: number, page = 1, pageSize = 20) {
    const result = await this.notificationRepo.listByUser(userId, page, pageSize);
    const unreadCount = await (this.notificationRepo as any).countUnread(userId);
    return { ...result, unreadCount };
  }
}
