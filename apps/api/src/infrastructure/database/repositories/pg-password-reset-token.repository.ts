import type { Pool } from 'pg';
import type { IPasswordResetTokenRepository, PasswordResetTokenEntity } from '../../../domain/repositories/password-reset-token.repository';

export class PgPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: { userId: number; token: string; expiresAt: Date }): Promise<PasswordResetTokenEntity> {
    const result = await this.pool.query<PasswordResetTokenEntity>(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, user_id AS "userId", token, expires_at AS "expiresAt", used,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.userId, data.token, data.expiresAt]
    );
    return result.rows[0];
  }

  async findByToken(token: string): Promise<PasswordResetTokenEntity | null> {
    const result = await this.pool.query<PasswordResetTokenEntity>(
      `SELECT id, user_id AS "userId", token, expires_at AS "expiresAt", used,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM password_reset_tokens WHERE token = $1`,
      [token]
    );
    return result.rows[0] ?? null;
  }

  async markAsUsed(token: string): Promise<void> {
    await this.pool.query(
      `UPDATE password_reset_tokens SET used = TRUE, updated_at = NOW() WHERE token = $1`,
      [token]
    );
  }
}
