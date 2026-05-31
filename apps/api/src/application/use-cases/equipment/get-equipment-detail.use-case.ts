import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import type { EquipmentDetailEntity } from '../../../domain/entities/equipment.entity';

export class GetEquipmentDetailUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(id: number): Promise<EquipmentDetailEntity> {
    const equipment = await this.equipmentRepo.getDetailById(id);
    if (!equipment) {
      throw new NotFoundError('Thiết bị');
    }
    return equipment;
  }
}
