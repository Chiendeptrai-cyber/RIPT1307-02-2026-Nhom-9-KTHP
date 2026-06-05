import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { EquipmentEntity } from '../../../domain/entities/equipment.entity';
import { AppError } from '../../../domain/errors/app.error';

export class UpdateEquipmentUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(
    id: number,
    data: {
      name?: string;
      totalQuantity?: number;
      categoryId?: number;
      status?: string;
      description?: string;
    },
  ): Promise<EquipmentEntity> {
    const existing = await this.equipmentRepo.findById(id);
    if (!existing) {
      throw new AppError('Thiết bị không tồn tại', 404, 'NOT_FOUND');
    }

    let availableQuantity = existing.availableQuantity;
    if (data.totalQuantity !== undefined) {
      const diff = data.totalQuantity - existing.totalQuantity;
      availableQuantity = Math.max(0, existing.availableQuantity + diff);
    }

    return this.equipmentRepo.update(id, {
      ...data,
      availableQuantity,
    } as any);
  }
}
