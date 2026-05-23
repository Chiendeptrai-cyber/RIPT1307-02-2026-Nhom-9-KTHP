import { UserRole, UserStatus } from '@equipment-mgmt/shared';

export interface UserEntity {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
