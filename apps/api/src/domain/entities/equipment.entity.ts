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
  createdAt: string;
  updatedAt: string;
}

export type InstanceCondition = 'good' | 'reserved' | 'borrowed' | 'damaged' | 'lost' | 'under_repair';

export interface EquipmentInstanceEntity {
  id: number;
  equipmentId: number;
  serialNumber: string;
  condition: InstanceCondition;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentDetailEntity extends EquipmentEntity {
  instances: EquipmentInstanceEntity[];
}
