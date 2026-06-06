import type { Request, Response } from 'express';
import {
  createBorrowRequestUseCase,
  approveBorrowRequestUseCase,
  rejectBorrowRequestUseCase,
  cancelBorrowRequestUseCase,
  markReceivedUseCase,
  markNotReceivedUseCase,
  markReturnedUseCase,
  borrowRequestRepo,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function createBorrowRequest(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { equipmentId, quantity, expectedReturnDate, note, rulesAccepted } = req.body as {
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
    note?: string;
    rulesAccepted?: boolean;
  };

  const result = await createBorrowRequestUseCase.execute({
    userId,
    equipmentId,
    quantity: quantity ?? 1,
    expectedReturnDate,
    note,
    rulesAccepted,
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
  const { page = '1', pageSize = '20', status, search, userId } = req.query as Record<string, string>;

  const result = await (borrowRequestRepo as any).listAll(Number(page), Number(pageSize), {
    status: status || undefined,
    search: search || undefined,
    userId: userId ? Number(userId) : undefined,
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

/** Admin: Xác nhận sinh viên đã đến nhận (approved → borrowing) */
export async function markReceived(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await markReceivedUseCase.execute(id);

  res.json({
    success: true,
    data: result,
    message: 'Đã xác nhận sinh viên nhận thiết bị — phiếu chuyển sang trạng thái Đang mượn',
  } satisfies ApiResponse);
}

/** Admin: Xác nhận sinh viên chưa đến nhận (approved → cancelled) */
export async function markNotReceived(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await markNotReceivedUseCase.execute(id);

  res.json({
    success: true,
    data: result,
    message: 'Đã hủy phiếu mượn — sinh viên không đến nhận',
  } satisfies ApiResponse);
}

/** Admin: Xác nhận sinh viên đã trả thiết bị (borrowing/overdue → returned) */
export async function markReturned(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await markReturnedUseCase.execute(id);

  res.json({
    success: true,
    data: result,
    message: 'Đã xác nhận nhận lại thiết bị — phiếu chuyển sang trạng thái Đã trả',
  } satisfies ApiResponse);
}

/** Admin: Danh sách phiếu sắp đến hạn + quá hạn */
export async function listDueOverdue(req: Request, res: Response): Promise<void> {
  const result = await (borrowRequestRepo as any).findDueSoonAndOverdue();

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}
