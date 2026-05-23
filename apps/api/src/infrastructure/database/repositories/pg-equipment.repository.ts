import type { Pool } from 'pg';
import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { EquipmentEntity } from '../../../domain/entities/equipment.entity';

export class PgEquipmentRepository implements IEquipmentRepository {
  constructor(private readonly pool: Pool) {}

  async findById(_id: number): Promise<EquipmentEntity | null> {
    return null;
  }

  async list(_page: number, _pageSize: number): Promise<{ items: EquipmentEntity[]; total: number }> {
    return { items: [], total: 0 };
  }

  async create(data: Omit<EquipmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentEntity> {
    return {
      ...data,
      id: 1,
      availableQuantity: data.totalQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as EquipmentEntity;
  }

  async update(id: number, data: Partial<EquipmentEntity>): Promise<EquipmentEntity> {
    return {
      ...data,
      id,
      name: data.name ?? 'updated',
      categoryId: data.categoryId ?? 1,
      totalQuantity: data.totalQuantity ?? 0,
      availableQuantity: data.availableQuantity ?? 0,
      status: data.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as EquipmentEntity;
  }
}
