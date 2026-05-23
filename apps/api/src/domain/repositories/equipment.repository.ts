import type { EquipmentEntity } from '../entities/equipment.entity';

export interface IEquipmentRepository {
  findById(id: number): Promise<EquipmentEntity | null>;
  list(page: number, pageSize: number): Promise<{ items: EquipmentEntity[]; total: number }>;
  create(data: Omit<EquipmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentEntity>;
  update(id: number, data: Partial<EquipmentEntity>): Promise<EquipmentEntity>;
}
