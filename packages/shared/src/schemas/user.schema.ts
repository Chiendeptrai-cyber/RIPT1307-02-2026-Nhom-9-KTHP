import { z } from 'zod';
import { UserStatus } from '../enums';

export const lockUserSchema = z.object({
  targetUserId: z.number().int().positive('User ID must be a positive integer'),
  newStatus: z.enum([UserStatus.ACTIVE, UserStatus.BORROW_BLOCKED, UserStatus.LOCKED]),
});

export type LockUserDto = z.infer<typeof lockUserSchema>;
