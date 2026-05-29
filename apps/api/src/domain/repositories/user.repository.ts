import type { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>;
  findAll(options: { page: number; pageSize: number; role?: string; status?: string }): Promise<{ items: UserEntity[]; total: number }>;
}
