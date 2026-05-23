import type { Request, Response } from 'express';

export async function listUsers(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: [], message: 'Users list' });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { id: req.user?.userId }, message: 'Profile loaded' });
}
