import type { Request, Response } from 'express';
import {
  createBorrowRequestUseCase,
  approveBorrowRequestUseCase,
  rejectBorrowRequestUseCase,
  cancelBorrowRequestUseCase,
  borrowRequestRepo,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function createBorrowRequest(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { equipmentId, quantity, expectedReturnDate, note } = req.body as {
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
    note?: string;
  };

  const result = await createBorrowRequestUseCase.execute({
    userId,
    equipmentId,
    quantity: quantity ?? 1,
    expectedReturnDate,
    note,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Tạo yêu cầu mượn thành công',
  } satisfies ApiResponse);
}

export async function listMyRequests(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { page = '1', pageSize = '10' } = req.query as Record<string, string>;

  const result = await (borrowRequestRepo as any).listByUser(userId, Number(page), Number(pageSize));

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}

export async function listAllRequests(req: Request, res: Response): Promise<void> {
  const { page = '1', pageSize = '20', status, search } = req.query as Record<string, string>;

  const result = await (borrowRequestRepo as any).listAll(Number(page), Number(pageSize), {
    status: status || undefined,
    search: search || undefined,
  });

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}

export async function approveBorrowRequest(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await approveBorrowRequestUseCase.execute(id);

  res.json({
    success: true,
    data: result,
    message: 'Đã duyệt yêu cầu mượn',
  } satisfies ApiResponse);
}

export async function rejectBorrowRequest(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { reason } = req.body as { reason: string };

  const result = await rejectBorrowRequestUseCase.execute(id, reason ?? 'Không đáp ứng yêu cầu');

  res.json({
    success: true,
    data: result,
    message: 'Đã từ chối yêu cầu mượn',
  } satisfies ApiResponse);
}

export async function cancelBorrowRequest(req: Request, res: Response): Promise<void> {
  const requestId = Number(req.params.id);
  const userId    = req.user!.userId;

  const result = await cancelBorrowRequestUseCase.execute(requestId, userId);

  res.json({
    success: true,
    data: result,
    message: 'Đã hủy yêu cầu mượn',
  } satisfies ApiResponse);
}
