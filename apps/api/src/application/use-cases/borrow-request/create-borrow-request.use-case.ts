import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { AppError } from '../../../domain/errors/app.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export class CreateBorrowRequestUseCase {
  constructor(
    private readonly borrowRequestRepo: IBorrowRequestRepository,
    private readonly equipmentRepo: IEquipmentRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(data: {
    userId: number;
    items: Array<{ equipmentId: number; quantity: number; expectedReturnDate: string }>;
    note?: string;
    rulesAccepted?: boolean;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new AppError('Phải có ít nhất 1 thiết bị', 400, 'INVALID_INPUT');
    }

    // 1. Validate từng item: thiết bị tồn tại + đủ hàng + ngày hợp lệ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);

    const equipmentNames: string[] = [];

    for (const item of data.items) {
      const equipment = await this.equipmentRepo.findById(item.equipmentId);
      if (!equipment) {
        throw new AppError(`Thiết bị ID ${item.equipmentId} không tồn tại`, 404, 'NOT_FOUND');
      }
      if (equipment.availableQuantity < item.quantity) {
        throw new AppError(
          `Thiết bị "${equipment.name}" chỉ còn ${equipment.availableQuantity} chiếc, không đủ để mượn ${item.quantity} chiếc`,
          400,
          'INSUFFICIENT_STOCK',
        );
      }
      equipmentNames.push(equipment.name);

      const returnDate = new Date(item.expectedReturnDate);
      if (returnDate <= today) {
        throw new AppError(`Ngày trả của "${equipment.name}" phải sau ngày hôm nay`, 400, 'INVALID_DATE');
      }
      if (returnDate > maxDate) {
        throw new AppError(`Ngày trả của "${equipment.name}" không được quá 14 ngày kể từ hôm nay`, 400, 'INVALID_DATE');
      }
    }

    // 2. Tính expected_return_date cho phiếu = MAX của tất cả items
    const requestExpectedReturnDate = data.items.reduce((max, item) => {
      const d = new Date(item.expectedReturnDate);
      return d > max ? d : max;
    }, new Date(0));

    // 3. Tạo borrow request
    const request = await this.borrowRequestRepo.create({
      userId: data.userId,
      status: BorrowRequestStatus.PENDING,
      expectedReturnDate: requestExpectedReturnDate.toISOString(),
      note: data.note,
      rulesAcceptedAt: new Date().toISOString(),
    } as any);

    // 3b. Lưu từng item vào borrow_request_items (kèm expectedReturnDate riêng)
    for (const item of data.items) {
      await this.borrowRequestRepo.createItem({
        borrowRequestId: request.id,
        equipmentId: item.equipmentId,
        quantity: item.quantity,
        expectedReturnDate: item.expectedReturnDate,
      });
    }

    // 4. Gửi thông báo cho sinh viên
    const equipmentSummary = equipmentNames.join(', ');
    await this.notificationRepo.create({
      userId: data.userId,
      type: NotificationType.NEW_REQUEST,
      title: 'Yêu cầu mượn đã được gửi',
      message: `Yêu cầu mượn thiết bị: ${equipmentSummary} của bạn đang chờ được phê duyệt.`,
      isRead: false,
    });

    // 5. Gửi thông báo cho tất cả admin
    try {
      const student = await this.userRepo.findById(data.userId);
      const studentName = student?.fullName ?? 'Sinh viên';
      const admins = await this.userRepo.findAll({ page: 1, pageSize: 100, role: 'admin' });
      for (const admin of admins.items) {
        await this.notificationRepo.create({
          userId: admin.id,
          type: NotificationType.NEW_REQUEST,
          title: 'Yêu cầu mượn mới',
          message: `Sinh viên ${studentName} đã gửi yêu cầu mượn: ${equipmentSummary}.`,
          isRead: false,
        });
      }
    } catch (err) {
      // Bỏ qua lỗi thông báo cho admin để không gián đoạn luồng chính
    }

    return { ...request, equipmentNames };
  }
}
