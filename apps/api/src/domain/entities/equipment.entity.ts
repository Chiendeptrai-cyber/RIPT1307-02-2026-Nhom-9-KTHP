import { EquipmentStatus } from '@equipment-mgmt/shared';

export interface EquipmentEntity {
  id: number;
  name: string;
  categoryId: number;
  totalQuantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt: string;
}
