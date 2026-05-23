import type { ViolationEntity } from '../entities/violation.entity';

export interface IViolationRepository {
  create(data: Omit<ViolationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ViolationEntity>;
}
