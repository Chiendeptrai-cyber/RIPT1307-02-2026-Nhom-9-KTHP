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
}
