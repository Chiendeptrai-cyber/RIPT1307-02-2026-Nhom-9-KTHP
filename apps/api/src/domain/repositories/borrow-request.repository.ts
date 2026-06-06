import type { BorrowRequestEntity } from '../entities/borrow-request.entity';

export interface IBorrowRequestRepository {
  findById(id: number): Promise<BorrowRequestEntity | null>;
  create(data: Omit<BorrowRequestEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BorrowRequestEntity>;
  createItem(data: { borrowRequestId: number; equipmentId: number; quantity: number }): Promise<void>;
  update(id: number, data: Partial<BorrowRequestEntity>): Promise<BorrowRequestEntity>;
  listAll(
    page: number,
    pageSize: number,
    filter?: { status?: string; search?: string; userId?: number },
  ): Promise<{ items: BorrowRequestEntity[]; total: number }>;
  listByUser(userId: number, page: number, pageSize: number): Promise<{ items: BorrowRequestEntity[]; total: number }>;
  countByStatus(status: string): Promise<number>;
  getItems(borrowRequestId: number): Promise<{ equipmentId: number; quantity: number }[]>;
  findDueSoonRequests(daysBefore: number): Promise<(BorrowRequestEntity & { userFullName: string; userEmail: string; equipmentName?: string })[]>;
  findDueTodayRequests(): Promise<(BorrowRequestEntity & { userFullName: string; userEmail: string; equipmentName?: string })[]>;
  findOverdueByDaysRequests(days: number): Promise<(BorrowRequestEntity & { userFullName: string; userEmail: string; equipmentName?: string })[]>;
  findDueSoonAndOverdue(): Promise<(BorrowRequestEntity & { userFullName: string; userEmail: string; equipmentName?: string; quantity?: number })[]>;
}
