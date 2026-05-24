import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export class GetEquipmentDetailUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(id: number) {
    const equipment = await this.equipmentRepo.findById(id);
    if (!equipment) {
      throw new NotFoundError('Thiết bị');
    }
    return equipment;
  }
}
