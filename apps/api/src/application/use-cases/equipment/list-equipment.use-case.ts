import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import { BUSINESS } from '@equipment-mgmt/shared';

export class ListEquipmentUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    status?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? BUSINESS.EQUIPMENT_PAGE_SIZE, 100);

    return this.equipmentRepo.list(page, pageSize, {
      search: params.search,
      categoryId: params.categoryId,
      status: params.status,
    });
  }
}
