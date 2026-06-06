import { BorrowRequestStatus } from '@equipment-mgmt/shared';

export interface BorrowRequestEntity {
  id: number;
  userId: number;
  status: BorrowRequestStatus;
  expectedReturnDate: string;
  note?: string;
  rulesAcceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
