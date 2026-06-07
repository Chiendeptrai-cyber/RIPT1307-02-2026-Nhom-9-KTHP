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

  async listAll(
    page: number,
    pageSize: number,
  ): Promise<{ items: any[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM notifications`
    );
    const total = Number(countResult.rows[0].total);

    const result = await this.pool.query(
      `SELECT n.id, n.user_id AS "userId", n.type, n.title, n.message,
              n.is_read AS "isRead",
              n.created_at AS "createdAt", n.updated_at AS "updatedAt",
              u.full_name AS recipient
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT $1 OFFSET $2`,
      [pageSize, offset]
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

  async getSettings(): Promise<any> {
    const result = await this.pool.query(`SELECT value FROM system_settings WHERE key = 'notification'`);
    if (result.rows.length === 0) return {};
    return result.rows[0].value;
  }

  async updateSettings(settings: any): Promise<void> {
    await this.pool.query(
      `INSERT INTO system_settings (key, value) VALUES ('notification', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [settings]
    );
  }

  async getRetryQueue(): Promise<any[]> {
    const result = await this.pool.query(`SELECT * FROM email_retry_queue ORDER BY created_at DESC`);
    return result.rows.map(r => ({
      id: `QUE-${r.id}`,
      time: r.created_at,
      event: r.event,
      recipient: r.recipient_name,
      email: r.recipient_email,
      tryNum: `${r.try_num}/${r.max_retries} lần`,
      error: r.last_error,
      status: r.status,
      realId: r.id
    }));
  }

  async retryEmail(id: number): Promise<void> {
    await this.pool.query(
      `UPDATE email_retry_queue
       SET try_num = try_num + 1, status = 'retrying', next_retry_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }
}
