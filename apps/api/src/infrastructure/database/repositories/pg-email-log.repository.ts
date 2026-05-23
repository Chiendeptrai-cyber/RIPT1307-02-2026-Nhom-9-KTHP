import type { Pool } from 'pg';
import type { IEmailLogRepository } from '../../../domain/repositories/email-log.repository';
import type { EmailLogEntity } from '../../../domain/entities/email-log.entity';

export class PgEmailLogRepository implements IEmailLogRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Omit<EmailLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailLogEntity> {
    return { id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as EmailLogEntity;
  }
}
