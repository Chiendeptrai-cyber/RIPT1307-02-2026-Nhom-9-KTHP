import type { INotificationRepository } from '../../../domain/repositories/notification.repository';

export class ListAllNotificationsUseCase {
  constructor(private readonly notificationRepo: INotificationRepository) { }

  async execute(page = 1, pageSize = 20) {
    const result = await this.notificationRepo.listAll(page, pageSize);
    return result;
  }
}
