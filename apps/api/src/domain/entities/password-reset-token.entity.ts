export interface PasswordResetTokenEntity {
  id: number;
  userId: number;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  updatedAt: string;
}
