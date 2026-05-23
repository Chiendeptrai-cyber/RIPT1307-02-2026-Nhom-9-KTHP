import type { Request, Response } from 'express';
import { createBorrowRequestUseCase } from '../../infrastructure/container';

export async function createBorrowRequest(req: Request, res: Response): Promise<void> {
  const result = await createBorrowRequestUseCase.execute({
    userId: req.user?.userId ?? 0,
    expectedReturnDate: req.body.expectedReturnDate,
    equipmentIds: req.body.equipmentIds,
  });
  res.json({ success: true, data: result, message: 'Borrow request created' });
}

export async function listBorrowRequests(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: [], message: 'Borrow request list' });
}
