import type { Pool } from 'pg';
import type { IEmailLogRepository } from '../../../domain/repositories/email-log.repository';
import type { EmailLogEntity } from '../../../domain/entities/email-log.entity';

export class PgEmailLogRepository implements IEmailLogRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Omit<EmailLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailLogEntity> {
    const result = await this.pool.query<EmailLogEntity>(
      `INSERT INTO email_logs (user_id, type, status, subject, recipient, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id AS "userId", type, status, subject, recipient,
                 error_message AS "errorMessage",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.userId, data.type, data.status, data.subject, data.recipient, data.errorMessage ?? null],
    );
    return result.rows[0];
  }
}
