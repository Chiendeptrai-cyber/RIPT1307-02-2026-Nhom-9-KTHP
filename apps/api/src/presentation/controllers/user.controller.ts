import type { Request, Response } from 'express';
import type { ApiResponse } from '@equipment-mgmt/shared';
import { UserRole, UserStatus } from '@equipment-mgmt/shared';
import { listUsersUseCase, lockUserUseCase, getUserProfileUseCase } from '../../infrastructure/container';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { page = 1, pageSize = 20, role, status } = req.query;
  
  // Validate role parameter if provided
  let validRole: UserRole | undefined;
  if (role && Object.values(UserRole).includes(role as UserRole)) {
    validRole = role as UserRole;
  }

  // Validate status parameter if provided
  let validStatus: UserStatus | undefined;
  if (status && Object.values(UserStatus).includes(status as UserStatus)) {
    validStatus = status as UserStatus;
  }

  const result = await listUsersUseCase.execute({
    userId: req.user!.userId,
    userRole: req.user!.role as UserRole,
    page: Number(page),
    pageSize: Number(pageSize),
    role: validRole,
    status: validStatus,
  });

  res.json({
    success: true,
    data: result,
    message: 'Users list retrieved',
  } satisfies ApiResponse);
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const result = await getUserProfileUseCase.execute({
    userId: req.user!.userId,
  });

  res.json({
    success: true,
    data: result,
    message: 'Profile loaded',
  } satisfies ApiResponse);
}

export async function lockUser(req: Request, res: Response): Promise<void> {
  const { targetUserId, newStatus } = req.body;

  const result = await lockUserUseCase.execute({
    adminId: req.user!.userId,
    adminRole: req.user!.role as UserRole,
    targetUserId,
    newStatus,
  });

  res.json({
    success: true,
    data: result,
    message: 'User status updated successfully',
  } satisfies ApiResponse);
}

