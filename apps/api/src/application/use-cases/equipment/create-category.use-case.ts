import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';

export class CreateCategoryUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(data: { name: string; description?: string }): Promise<{ id: number; name: string; description?: string }> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Tên loại thiết bị không được để trống');
    }
    return this.equipmentRepo.createCategory(data.name.trim(), data.description);
  }
}
