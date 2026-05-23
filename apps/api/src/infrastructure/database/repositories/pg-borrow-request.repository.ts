import type { Pool } from 'pg';
import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { BorrowRequestEntity } from '../../../domain/entities/borrow-request.entity';

export class PgBorrowRequestRepository implements IBorrowRequestRepository {
  constructor(private readonly pool: Pool) {}

  async findById(_id: number): Promise<BorrowRequestEntity | null> {
    return null;
  }

  async create(data: Omit<BorrowRequestEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BorrowRequestEntity> {
    return { id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as BorrowRequestEntity;
  }

  async update(id: number, data: Partial<BorrowRequestEntity>): Promise<BorrowRequestEntity> {
    return {
      id,
      userId: data.userId ?? 1,
      status: data.status ?? 'pending',
      expectedReturnDate: data.expectedReturnDate ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as BorrowRequestEntity;
  }

  async listByUser(_userId: number, _page: number, _pageSize: number): Promise<{ items: BorrowRequestEntity[]; total: number }> {
    return { items: [], total: 0 };
  }
}
