export interface PasswordResetTokenEntity {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPasswordResetTokenRepository {
  create(data: { userId: number; token: string; expiresAt: Date }): Promise<PasswordResetTokenEntity>;
  findByToken(token: string): Promise<PasswordResetTokenEntity | null>;
  markAsUsed(token: string): Promise<void>;
}
