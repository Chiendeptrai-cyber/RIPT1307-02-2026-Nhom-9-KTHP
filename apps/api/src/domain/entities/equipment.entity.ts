import { EquipmentStatus } from '@equipment-mgmt/shared';

export interface EquipmentEntity {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  totalQuantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
