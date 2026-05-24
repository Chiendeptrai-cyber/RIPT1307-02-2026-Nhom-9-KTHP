import type { Request, Response } from 'express';
import {
  listNotificationsUseCase,
  markNotificationReadUseCase,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { page = '1', pageSize = '20' } = req.query as Record<string, string>;

  const result = await listNotificationsUseCase.execute(userId, Number(page), Number(pageSize));

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id }  = req.params;

  const result = await markNotificationReadUseCase.execute(
    id === 'all' ? 'all' : Number(id),
    userId,
  );

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}
