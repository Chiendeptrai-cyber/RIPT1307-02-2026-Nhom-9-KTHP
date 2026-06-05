import type { Pool } from 'pg';
import type { IStockLogRepository } from '../../../domain/repositories/stock-log.repository';
import type { EquipmentStockLogEntity } from '../../../domain/entities/equipment-stock-log.entity';

export class PgStockLogRepository implements IStockLogRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Omit<EquipmentStockLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentStockLogEntity> {
    const result = await this.pool.query<EquipmentStockLogEntity>(
      `INSERT INTO equipment_stock_logs (equipment_id, action, quantity, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, equipment_id AS "equipmentId", action, quantity, note,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.equipmentId, data.action, data.quantity, data.note ?? null],
    );
    return result.rows[0];
  }
}
