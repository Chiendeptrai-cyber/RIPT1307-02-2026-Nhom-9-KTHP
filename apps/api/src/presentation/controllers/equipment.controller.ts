import type { Request, Response } from 'express';
import {
  listEquipmentUseCase,
  getEquipmentDetailUseCase,
  createEquipmentUseCase,
  updateEquipmentUseCase,
  deleteEquipmentWithValidationUseCase,
  stockAdjustmentUseCase,
  changeEquipmentStatusUseCase,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listEquipment(req: Request, res: Response): Promise<void> {
  const { page = '1', pageSize = '20', search, categoryId, status } = req.query as Record<string, string>;
  const result = await listEquipmentUseCase.execute({
    page: Number(page), pageSize: Number(pageSize),
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status: status || undefined,
  });
  res.json({ success: true, data: result, message: 'OK' } satisfies ApiResponse);
}

export async function getEquipmentDetail(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const equipment = await getEquipmentDetailUseCase.execute(id);
  res.json({ success: true, data: equipment, message: 'OK' } satisfies ApiResponse);
}

export async function createEquipment(req: Request, res: Response): Promise<void> {
  const { name, totalQuantity, categoryId, status, description } = req.body;
  const result = await createEquipmentUseCase.execute({
    name, totalQuantity: Number(totalQuantity),
    categoryId: Number(categoryId) || 1,
    status: status || 'active', description,
  });
  res.status(201).json({ success: true, data: result, message: 'Tạo thiết bị thành công' } satisfies ApiResponse);
}

export async function updateEquipment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { name, totalQuantity, categoryId, status, description } = req.body;
  const result = await updateEquipmentUseCase.execute(id, {
    name, description, status,
    totalQuantity: totalQuantity !== undefined ? Number(totalQuantity) : undefined,
    categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
  });
  res.json({ success: true, data: result, message: 'Cập nhật thiết bị thành công' } satisfies ApiResponse);
}

export async function deleteEquipment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await deleteEquipmentWithValidationUseCase.execute(id);
  res.json({ success: true, data: result, message: 'Xóa thiết bị thành công' } satisfies ApiResponse);
}

/** PATCH /equipment/:id/stock-adjustment — Điều chỉnh kho */
export async function stockAdjustment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { type, quantity, note, newTotalQuantity, newAvailableQuantity, reason } = req.body;

  const result = await stockAdjustmentUseCase.execute({
    equipmentId: id,
    type,
    quantity: quantity !== undefined ? Number(quantity) : 0,
    note,
    newTotalQuantity: newTotalQuantity !== undefined ? Number(newTotalQuantity) : undefined,
    newAvailableQuantity: newAvailableQuantity !== undefined ? Number(newAvailableQuantity) : undefined,
    reason,
  });

  res.json({ success: true, data: result.equipment, message: 'Cập nhật kho thành công' } satisfies ApiResponse);
}

/** PATCH /equipment/:id/change-status — Chuyển trạng thái */
export async function changeEquipmentStatus(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { status } = req.body as { status: string };

  const result = await changeEquipmentStatusUseCase.execute(id, status);
  res.json({ success: true, data: result, message: `Chuyển trạng thái thành công` } satisfies ApiResponse);
}
