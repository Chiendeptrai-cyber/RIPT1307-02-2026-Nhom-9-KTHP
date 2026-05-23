import type { EmailLogEntity } from '../entities/email-log.entity';

export interface IEmailLogRepository {
  create(data: Omit<EmailLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailLogEntity>;
}
