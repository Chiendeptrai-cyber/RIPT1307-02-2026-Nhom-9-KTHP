import type { BorrowRecordEntity } from '../entities/borrow-record.entity';

export interface IBorrowRecordRepository {
  findById(id: number): Promise<BorrowRecordEntity | null>;
  create(data: Omit<BorrowRecordEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BorrowRecordEntity>;
  update(id: number, data: Partial<BorrowRecordEntity>): Promise<BorrowRecordEntity>;
  findByBorrowRequestId(borrowRequestId: number): Promise<BorrowRecordEntity | null>;
}
