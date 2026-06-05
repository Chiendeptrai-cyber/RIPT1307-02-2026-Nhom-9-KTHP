import { EquipmentStatus } from '@equipment-mgmt/shared';

export interface EquipmentEntity {
  id: number;
  name: string;
  categoryId: number;
  totalQuantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
