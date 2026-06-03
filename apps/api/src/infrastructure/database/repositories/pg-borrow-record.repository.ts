import type { Pool } from 'pg';
import type { IBorrowRecordRepository } from '../../../domain/repositories/borrow-record.repository';
import type { BorrowRecordEntity } from '../../../domain/entities/borrow-record.entity';

export class PgBorrowRecordRepository implements IBorrowRecordRepository {
  constructor(private readonly pool: Pool) {}

  async findById(_id: number): Promise<BorrowRecordEntity | null> {
    return null;
  }

  async create(data: Omit<BorrowRecordEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BorrowRecordEntity> {
    return {
      ...data,
      id: 1,
      returnedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BorrowRecordEntity;
  }

  async update(id: number, data: Partial<BorrowRecordEntity>): Promise<BorrowRecordEntity> {
    return {
      ...data,
      id,
      borrowRequestId: data.borrowRequestId ?? 1,
      status: data.status ?? 'borrowed',
      borrowedAt: data.borrowedAt ?? new Date().toISOString(),
      expectedReturnDate: data.expectedReturnDate ?? new Date().toISOString(),
      returnedAt: data.returnedAt ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BorrowRecordEntity;
  }

  async countAll(): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM borrow_records`,
    );
    return Number(result.rows[0].total);
  }

  async countOverdue(): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM borrow_records
       WHERE status = 'overdue'
          OR (expected_return_date < NOW() AND returned_at IS NULL)`,
    );
    return Number(result.rows[0].total);
  }

  async listByDateRange(from?: string, to?: string): Promise<BorrowRecordEntity[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (from) {
      conditions.push(`borrowed_at >= $${idx++}`);
      values.push(new Date(from).toISOString());
    }
    if (to) {
      conditions.push(`borrowed_at <= $${idx++}`);
      values.push(new Date(to).toISOString());
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.pool.query<BorrowRecordEntity>(
      `SELECT id, borrow_request_id AS "borrowRequestId", status,
              borrowed_at AS "borrowedAt", expected_return_date AS "expectedReturnDate",
              returned_at AS "returnedAt", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM borrow_records
       ${where}
       ORDER BY borrowed_at DESC`,
      values,
    );

    return result.rows;
  }
}
