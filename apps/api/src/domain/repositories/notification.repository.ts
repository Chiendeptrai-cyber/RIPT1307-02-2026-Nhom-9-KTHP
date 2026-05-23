import type { NotificationEntity } from '../entities/notification.entity';

export interface INotificationRepository {
  listByUser(userId: number, page: number, pageSize: number): Promise<{ items: NotificationEntity[]; total: number }>;
  markRead(id: number): Promise<NotificationEntity>;
  create(data: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationEntity>;
}
