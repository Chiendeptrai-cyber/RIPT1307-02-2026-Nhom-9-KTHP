import type { Pool } from 'pg';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';

export class PgUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(_id: number): Promise<UserEntity | null> {
    return null;
  }

  async findByEmail(_email: string): Promise<UserEntity | null> {
    return null;
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    return { id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as UserEntity;
  }

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    return {
      id,
      fullName: 'updated',
      email: 'updated@example.com',
      passwordHash: '',
      role: data.role ?? 'student',
      status: data.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as UserEntity;
  }

  async findAll(_options: { page: number; pageSize: number; role?: string }): Promise<{ items: UserEntity[]; total: number }> {
    return { items: [], total: 0 };
  }
}
