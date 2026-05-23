import type { Pool } from 'pg';
import type { IViolationRepository } from '../../../domain/repositories/violation.repository';
import type { ViolationEntity } from '../../../domain/entities/violation.entity';

export class PgViolationRepository implements IViolationRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Omit<ViolationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ViolationEntity> {
    return { id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as ViolationEntity;
  }
}
