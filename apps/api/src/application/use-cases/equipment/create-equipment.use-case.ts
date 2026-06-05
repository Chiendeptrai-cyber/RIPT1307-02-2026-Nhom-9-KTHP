import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { EquipmentEntity } from '../../../domain/entities/equipment.entity';

export class CreateEquipmentUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(data: {
    name: string;
    totalQuantity: number;
    categoryId: number;
    status: string;
    description?: string;
  }): Promise<EquipmentEntity> {
    return this.equipmentRepo.create({
      name: data.name,
      totalQuantity: data.totalQuantity,
      availableQuantity: data.totalQuantity,
      categoryId: data.categoryId,
      status: data.status as any,
      description: data.description,
    } as any);
  }
}
