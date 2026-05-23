import type { Request, Response } from 'express';

export async function listEquipment(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: [], message: 'Equipment list' });
}

export async function getEquipmentDetail(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: null, message: 'Equipment detail' });
}
