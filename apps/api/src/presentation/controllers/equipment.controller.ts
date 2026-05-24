import type { Request, Response } from 'express';
import {
  listEquipmentUseCase,
  getEquipmentDetailUseCase,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listEquipment(req: Request, res: Response): Promise<void> {
  const { page = '1', pageSize = '20', search, categoryId, status } = req.query as Record<string, string>;

  const result = await listEquipmentUseCase.execute({
    page: Number(page),
    pageSize: Number(pageSize),
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status: status || undefined,
  });

  res.json({
    success: true,
    data: result,
    message: 'Lấy danh sách thiết bị thành công',
  } satisfies ApiResponse);
}

export async function getEquipmentDetail(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const equipment = await getEquipmentDetailUseCase.execute(id);

  res.json({
    success: true,
    data: equipment,
    message: 'Lấy thông tin thiết bị thành công',
  } satisfies ApiResponse);
}
