import { ViolationType } from '@equipment-mgmt/shared';

export interface ViolationEntity {
  id: number;
  userId: number;
  borrowRecordId: number;
  type: ViolationType;
  description: string;
  createdAt: string;
  updatedAt: string;
}
