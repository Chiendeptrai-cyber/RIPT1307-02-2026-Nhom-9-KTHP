import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { EquipmentEntity } from '../../../domain/entities/equipment.entity';

function autoClassify(name: string, currentCategoryId: number): number {
  if (currentCategoryId !== 1) {
    return currentCategoryId;
  }
  const lower = name.toLowerCase();
  if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('máy tính') || lower.includes('pc') || lower.includes('computer')) {
    return 2; // Máy tính & Laptop
  }
  if (lower.includes('chiếu') || lower.includes('projector') || lower.includes('màn chiếu') || lower.includes('laser')) {
    return 3; // Thiết bị trình chiếu
  }
  if (lower.includes('switch') || lower.includes('router') || lower.includes('mạng') || lower.includes('wifi') || lower.includes('hub') || lower.includes('docking') || lower.includes('lan')) {
    return 4; // Mạng & Kết nối
  }
  if (lower.includes('webcam') || lower.includes('camera') || lower.includes('micro') || lower.includes('loa') || lower.includes('headphone') || lower.includes('tai nghe') || lower.includes('sound') || lower.includes('audio')) {
    return 5; // Âm thanh & Hình ảnh
  }
  if (lower.includes('fluke') || lower.includes('oscilloscope') || lower.includes('đo') || lower.includes('nguồn dc') || lower.includes('meter')) {
    return 6; // Thiết bị đo lường
  }
  if (lower.includes('hdmi') || lower.includes('usb') || lower.includes('adapter') || lower.includes('sạc') || lower.includes('bàn phím') || lower.includes('keyboard') || lower.includes('chuột') || lower.includes('mouse') || lower.includes('cáp')) {
    return 7; // Phụ kiện & Cáp
  }
  return 1; // Chung
}

export class CreateEquipmentUseCase {
  constructor(private readonly equipmentRepo: IEquipmentRepository) {}

  async execute(data: {
    name: string;
    totalQuantity: number;
    categoryId: number;
    status: string;
    description?: string;
    imageUrl?: string | null;
  }): Promise<EquipmentEntity> {
    const categoryId = autoClassify(data.name, data.categoryId);
    return this.equipmentRepo.create({
      name: data.name,
      totalQuantity: data.totalQuantity,
      availableQuantity: data.totalQuantity,
      categoryId,
      status: data.status as any,
      description: data.description,
      imageUrl: data.imageUrl ?? null,
    } as any);
  }
}
