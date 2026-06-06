import { z } from 'zod';
import { UserStatus } from '../enums/index.ts';

export const lockUserSchema = z.object({
  targetUserId: z.number().int().positive('User ID must be a positive integer'),
  newStatus: z.enum([UserStatus.ACTIVE, UserStatus.LOCKED]),
  reason: z.string().optional(),
});

export type LockUserDto = z.infer<typeof lockUserSchema>;
