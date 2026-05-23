import type { EquipmentStockLogEntity } from '../entities/equipment-stock-log.entity';

export interface IStockLogRepository {
  create(data: Omit<EquipmentStockLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentStockLogEntity>;
}
