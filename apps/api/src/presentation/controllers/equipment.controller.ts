import type { Request, Response } from 'express';
import {
  listEquipmentUseCase,
  getEquipmentDetailUseCase,
  createEquipmentUseCase,
  updateEquipmentUseCase,
  deleteEquipmentUseCase,
  createCategoryUseCase,
  equipmentRepo,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listCategories(req: Request, res: Response): Promise<void> {
  const categories = await equipmentRepo.listCategories();
  res.json({
    success: true,
    data: categories,
    message: 'Lấy danh sách danh mục thiết bị thành công',
  } satisfies ApiResponse);
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const { name, description } = req.body;
  const category = await createCategoryUseCase.execute({ name, description });
  res.status(201).json({
    success: true,
    data: category,
    message: 'Tạo loại thiết bị mới thành công',
  } satisfies ApiResponse);
}

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

export async function createEquipment(req: Request, res: Response): Promise<void> {
  const { name, totalQuantity, categoryId, status, description } = req.body;
  const result = await createEquipmentUseCase.execute({
    name,
    totalQuantity: Number(totalQuantity),
    categoryId: Number(categoryId),
    status: status || 'active',
    description,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Tạo thiết bị thành công',
  } satisfies ApiResponse);
}

export async function updateEquipment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { name, totalQuantity, categoryId, status, description } = req.body;

  const result = await updateEquipmentUseCase.execute(id, {
    name,
    totalQuantity: totalQuantity !== undefined ? Number(totalQuantity) : undefined,
    categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
    status,
    description,
  });

  res.json({
    success: true,
    data: result,
    message: 'Cập nhật thiết bị thành công',
  } satisfies ApiResponse);
}

export async function deleteEquipment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await deleteEquipmentUseCase.execute(id);

  res.json({
    success: true,
    data: result,
    message: 'Xóa thiết bị thành công',
  } satisfies ApiResponse);
}

