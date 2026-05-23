import type { Pool } from 'pg';
import type { IStockLogRepository } from '../../../domain/repositories/stock-log.repository';
import type { EquipmentStockLogEntity } from '../../../domain/entities/equipment-stock-log.entity';

export class PgStockLogRepository implements IStockLogRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Omit<EquipmentStockLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentStockLogEntity> {
    return { id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as EquipmentStockLogEntity;
  }
}
