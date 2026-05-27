import type { Pool } from 'pg';
import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { BorrowRequestEntity } from '../../../domain/entities/borrow-request.entity';

export class PgBorrowRequestRepository implements IBorrowRequestRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<BorrowRequestEntity | null> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT id, user_id AS "userId", status,
              expected_return_date AS "expectedReturnDate",
              note,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM borrow_requests WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(
    data: Omit<BorrowRequestEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BorrowRequestEntity> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `INSERT INTO borrow_requests (user_id, status, expected_return_date, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id AS "userId", status,
                 expected_return_date AS "expectedReturnDate",
                 note, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.userId, data.status, data.expectedReturnDate, (data as any).note ?? null],
    );
    return result.rows[0];
  }

  async update(
    id: number,
    data: Partial<BorrowRequestEntity>,
  ): Promise<BorrowRequestEntity> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status !== undefined)             { sets.push(`status = $${idx++}`);               values.push(data.status); }
    if (data.expectedReturnDate !== undefined) { sets.push(`expected_return_date = $${idx++}`); values.push(data.expectedReturnDate); }
    if ((data as any).note !== undefined)      { sets.push(`note = $${idx++}`);                 values.push((data as any).note); }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.pool.query<BorrowRequestEntity>(
      `UPDATE borrow_requests SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING id, user_id AS "userId", status,
                 expected_return_date AS "expectedReturnDate",
                 note, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values,
    );
    return result.rows[0];
  }

  async listByUser(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<{ items: BorrowRequestEntity[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM borrow_requests WHERE user_id = $1`,
      [userId],
    );
    const total = Number(countResult.rows[0].total);

    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT id, user_id AS "userId", status,
              expected_return_date AS "expectedReturnDate",
              note, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM borrow_requests WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset],
    );

    return { items: result.rows, total };
  }

  async listAll(
    page: number,
    pageSize: number,
    options?: { status?: string; search?: string },
  ): Promise<{ items: (BorrowRequestEntity & { userFullName: string; userEmail: string })[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (options?.status) {
      conditions.push(`br.status = $${idx++}`);
      values.push(options.status);
    }
    if (options?.search) {
      conditions.push(`u.full_name ILIKE $${idx++}`);
      values.push(`%${options.search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       ${where}`,
      values,
    );
    const total = Number(countResult.rows[0].total);

    values.push(pageSize, offset);
    const result = await this.pool.query(
      `SELECT br.id, br.user_id AS "userId", br.status,
              br.expected_return_date AS "expectedReturnDate",
              br.note, br.created_at AS "createdAt", br.updated_at AS "updatedAt",
              u.full_name AS "userFullName", u.email AS "userEmail"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       ${where}
       ORDER BY br.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    );

    return { items: result.rows, total };
  }
}
