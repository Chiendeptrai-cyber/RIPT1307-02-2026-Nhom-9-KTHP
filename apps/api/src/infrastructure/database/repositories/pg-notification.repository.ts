import type { Pool } from 'pg';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import type { NotificationEntity } from '../../../domain/entities/notification.entity';
import { NotificationType } from '@equipment-mgmt/shared';

export class PgNotificationRepository implements INotificationRepository {
  constructor(private readonly pool: Pool) {}

  async listByUser(_userId: number, _page: number, _pageSize: number): Promise<{ items: NotificationEntity[]; total: number }> {
    return { items: [], total: 0 };
  }

  async markRead(id: number): Promise<NotificationEntity> {
    return {
      id,
      userId: 1,
      type: NotificationType.APPROVED,
      title: '',
      message: '',
      isRead: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as NotificationEntity;
  }

  async create(data: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationEntity> {
    return { id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as NotificationEntity;
  }
}
