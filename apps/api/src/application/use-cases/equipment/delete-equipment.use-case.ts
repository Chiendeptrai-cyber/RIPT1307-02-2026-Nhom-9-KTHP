import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import { AppError } from '../../../domain/errors/app.error';

export class DeleteEquipmentUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(id: number): Promise<{ id: number }> {
    const existing = await this.equipmentRepo.findById(id);
    if (!existing) {
      throw new AppError('Thiết bị không tồn tại', 404, 'NOT_FOUND');
    }

    await this.equipmentRepo.update(id, {
      status: 'deleted' as any,
    });

    return { id };
  }
}
