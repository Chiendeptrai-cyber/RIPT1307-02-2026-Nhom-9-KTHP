import { BorrowRequestStatus } from '@equipment-mgmt/shared';

export interface BorrowRequestEntity {
  id: number;
  userId: number;
  status: BorrowRequestStatus;
  expectedReturnDate: string;
  createdAt: string;
  updatedAt: string;
}
