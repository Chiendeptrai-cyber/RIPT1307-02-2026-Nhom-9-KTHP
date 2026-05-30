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
  async findByBorrowRequestId(borrowRequestId: number): Promise<any | null> {
    const query = 'SELECT * FROM borrow_records WHERE borrow_request_id = $1 LIMIT 1';
    // Lưu ý: Tùy vào cách nhóm bạn gọi biến kết nối DB, có thể là this.pool hoặc pool
    const result = await this.pool.query(query, [borrowRequestId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    // Lấy dòng dữ liệu đầu tiên tìm được
    const row = result.rows[0];
    
    // Map dữ liệu từ DB (thường viết kiểu snake_case) sang chuẩn Entity của nhóm bạn
    return {
      id: row.id,
      borrowRequestId: row.borrow_request_id,
      status: row.status,
      borrowedAt: row.borrowed_at,
      expectedReturnDate: row.expected_return_date,
      returnedAt: row.returned_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
