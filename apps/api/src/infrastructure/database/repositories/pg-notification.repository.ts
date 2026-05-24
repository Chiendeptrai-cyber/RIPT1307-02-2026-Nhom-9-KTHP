import type { Pool } from 'pg';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import type { NotificationEntity } from '../../../domain/entities/notification.entity';

export class PgNotificationRepository implements INotificationRepository {
  constructor(private readonly pool: Pool) {}

  async create(
    data: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<NotificationEntity> {
    const result = await this.pool.query<NotificationEntity>(
      `INSERT INTO notifications (user_id, type, title, message, is_read)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id AS "userId", type, title, message,
                 is_read AS "isRead",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.userId, data.type, data.title, data.message, false],
    );
    return result.rows[0];
  }

  async listByUser(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<{ items: NotificationEntity[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1`,
      [userId],
    );
    const total = Number(countResult.rows[0].total);

    const result = await this.pool.query<NotificationEntity>(
      `SELECT id, user_id AS "userId", type, title, message,
              is_read AS "isRead",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset],
    );

    return { items: result.rows, total };
  }

  async markRead(id: number): Promise<NotificationEntity> {
    const result = await this.pool.query<NotificationEntity>(
      `UPDATE notifications
       SET is_read = true, updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id AS "userId", type, title, message,
                 is_read AS "isRead",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [id],
    );
    return result.rows[0];
  }

  async markAllRead(userId: number): Promise<void> {
    await this.pool.query(
      `UPDATE notifications SET is_read = true, updated_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    );
  }

  async countUnread(userId: number): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    );
    return Number(result.rows[0].count);
  }
}
