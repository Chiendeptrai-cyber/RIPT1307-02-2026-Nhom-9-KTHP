import { InstanceCondition } from '@equipment-mgmt/shared';

export interface EquipmentInstanceEntity {
  id: number;
  equipmentId: number;
  serialNumber: string;
  condition: InstanceCondition;
  createdAt: string;
  updatedAt: string;
}
