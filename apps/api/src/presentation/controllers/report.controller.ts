import type { Request, Response } from 'express';

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { totalRequests: 0 }, message: 'Dashboard stats' });
}

export async function exportReport(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { url: '' }, message: 'Report exported' });
}
