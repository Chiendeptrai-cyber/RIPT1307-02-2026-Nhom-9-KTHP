import type { Request, Response } from 'express';

export async function listNotifications(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: [], message: 'Notifications loaded' });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: null, message: `Notification ${req.params.id} marked read` });
}
