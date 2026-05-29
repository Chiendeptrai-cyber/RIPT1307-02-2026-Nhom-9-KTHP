import type { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';

export class PgUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<UserEntity | null> {
    const result = await this.pool.query<UserEntity>(
      `SELECT id, full_name AS "fullName", email, password_hash AS "passwordHash",
              role, status,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.pool.query<UserEntity>(
      `SELECT id, full_name AS "fullName", email, password_hash AS "passwordHash",
              role, status,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM users WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async create(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(data.passwordHash, 10);
    const result = await this.pool.query<UserEntity>(
      `INSERT INTO users (full_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name AS "fullName", email, password_hash AS "passwordHash",
                 role, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.fullName, data.email, passwordHash, data.role, data.status],
    );
    return result.rows[0];
  }

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.fullName !== undefined) { sets.push(`full_name = $${idx++}`); values.push(data.fullName); }
    if (data.email !== undefined)    { sets.push(`email = $${idx++}`);     values.push(data.email); }
    if (data.role !== undefined)     { sets.push(`role = $${idx++}`);      values.push(data.role); }
    if (data.status !== undefined)   { sets.push(`status = $${idx++}`);    values.push(data.status); }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.pool.query<UserEntity>(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING id, full_name AS "fullName", email, password_hash AS "passwordHash",
                 role, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values,
    );
    return result.rows[0];
  }

  async findAll(options: {
    page: number;
    pageSize: number;
    role?: string;
    status?: string;
  }): Promise<{ items: UserEntity[]; total: number }> {
    const offset = (options.page - 1) * options.pageSize;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (options.role) {
      conditions.push(`role = $${idx++}`);
      values.push(options.role);
    }

    if (options.status) {
      conditions.push(`status = $${idx++}`);
      values.push(options.status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      values,
    );
    const total = Number(countResult.rows[0].total);

    values.push(options.pageSize, offset);
    const result = await this.pool.query<UserEntity>(
      `SELECT id, full_name AS "fullName", email, password_hash AS "passwordHash",
              role, status, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    );

    return { items: result.rows, total };
  }
}
