import type { BorrowRequestEntity } from '../entities/borrow-request.entity';

export interface IBorrowRequestRepository {
  findById(id: number): Promise<BorrowRequestEntity | null>;
  create(data: Omit<BorrowRequestEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BorrowRequestEntity>;
  createItem(data: { borrowRequestId: number; equipmentId: number; quantity: number }): Promise<void>;
  update(id: number, data: Partial<BorrowRequestEntity>): Promise<BorrowRequestEntity>;
  listByUser(userId: number, page: number, pageSize: number): Promise<{ items: BorrowRequestEntity[]; total: number }>;
  countByStatus(status: string): Promise<number>;
  getItems(borrowRequestId: number): Promise<{ equipmentId: number; quantity: number }[]>;
}

