import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export class CreateBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(data: {
    userId: number;
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
    note?: string;
  }) {
    // 1. Kiểm tra thiết bị tồn tại và còn hàng
    const equipment = await this.equipmentRepo.findById(data.equipmentId);
    if (!equipment) {
      throw new AppError('Thiết bị không tồn tại', 404, 'NOT_FOUND');
    }
    if (equipment.availableQuantity < data.quantity) {
      throw new AppError(
        `Thiết bị chỉ còn ${equipment.availableQuantity} chiếc, không đủ để mượn ${data.quantity} chiếc`,
        400,
        'INSUFFICIENT_STOCK',
      );
    }

    // 2. Kiểm tra ngày trả hợp lệ (tối đa 14 ngày)
    const returnDate = new Date(data.expectedReturnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);

    if (returnDate <= today) {
      throw new AppError('Ngày trả phải sau ngày hôm nay', 400, 'INVALID_DATE');
    }
    if (returnDate > maxDate) {
      throw new AppError('Ngày trả không được quá 14 ngày kể từ hôm nay', 400, 'INVALID_DATE');
    }

    // 3. Tạo borrow request
    const request = await this.borrowRequestRepo.create({
      userId: data.userId,
      status: BorrowRequestStatus.PENDING,
      expectedReturnDate: data.expectedReturnDate,
      note: data.note,
    } as any);

    // 4. Gửi thông báo cho sinh viên
    await this.notificationRepo.create({
      userId: data.userId,
      type: NotificationType.NEW_REQUEST,
      title: 'Yêu cầu mượn đã được gửi',
      message: `Yêu cầu mượn thiết bị "${equipment.name}" của bạn đang chờ được phê duyệt.`,
      isRead: false,
    });

    return { ...request, equipmentName: equipment.name };
  }
}
