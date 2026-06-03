import type { Request, Response } from 'express';
import { getDashboardStatsUseCase, exportReportUseCase } from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';
import { UserRole } from '@equipment-mgmt/shared';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const result = await getDashboardStatsUseCase.execute({
    userRole: req.user!.role as UserRole,
  });

  res.json({
    success: true,
    data: result,
    message: 'Dashboard stats retrieved',
  } satisfies ApiResponse);
}

export async function exportReport(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as Record<string, string | undefined>;

  const result = await exportReportUseCase.execute({
    userRole: req.user!.role as UserRole,
    from,
    to,
  });

  res.json({
    success: true,
    data: result,
    message: 'Report exported',
  } satisfies ApiResponse);
}
