import { BorrowRequestStatus } from '@equipment-mgmt/shared';

export interface BorrowRequestEntity {
  id: number;
  userId: number;
  equipmentId: number;
  quantity: number;
  status: BorrowRequestStatus;
  expectedReturnDate: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}
