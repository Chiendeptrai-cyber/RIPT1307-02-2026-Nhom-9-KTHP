import { BorrowRecordStatus } from '@equipment-mgmt/shared';

export interface BorrowRecordEntity {
  id: number;
  borrowRequestId: number;
  status: BorrowRecordStatus;
  borrowedAt: string;
  expectedReturnDate: string;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
