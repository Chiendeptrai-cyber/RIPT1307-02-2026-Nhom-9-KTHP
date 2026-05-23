import { StockActionType } from '@equipment-mgmt/shared';

export interface EquipmentStockLogEntity {
  id: number;
  equipmentId: number;
  action: StockActionType;
  quantity: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}
