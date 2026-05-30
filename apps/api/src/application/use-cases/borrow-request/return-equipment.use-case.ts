import { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import { IBorrowRecordRepository } from '../../../domain/repositories/borrow-record.repository';
import { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface ReturnEquipmentInput {
  borrowRequestId: string;
  adminId: string;
}

export class ReturnEquipmentUseCase {
  constructor(
    private borrowRequestRepo: IBorrowRequestRepository,
    private borrowRecordRepo: IBorrowRecordRepository,
    private equipmentRepo: IEquipmentRepository,
    private notificationRepo: INotificationRepository
  ) {}

  async execute(input: ReturnEquipmentInput): Promise<void> {
    const { borrowRequestId, adminId } = input;

    // 1. Kiểm tra sự tồn tại của phiếu yêu cầu
    const request = await this.borrowRequestRepo.findById(borrowRequestId);
    if (!request) {
      throw new NotFoundError('Không tìm thấy phiếu yêu cầu mượn thiết bị.');
    }

    // 2. Ràng buộc: Chỉ hoàn kho nếu trạng thái hiện tại là BORROWING
    if (request.status !== 'BORROWING') {
      throw new AppError('Phiếu yêu cầu không ở trạng thái đang mượn thiết bị.');
    }

    // 3. Chuyển trạng thái phiếu sang RETURNED (Đã trả)
    request.status = 'RETURNED';
    request.updatedAt = new Date();
    await this.borrowRequestRepo.update(request);

    // 4. Cập nhật thông tin trả đồ vào bản ghi mượn trả (Borrow Record)
    const borrowRecord = await this.borrowRecordRepo.findByBorrowRequestId(borrowRequestId);
    if (borrowRecord) {
      borrowRecord.returnedTo = adminId;
      borrowRecord.returnedAt = new Date();
      borrowRecord.status = 'RETURNED';
      borrowRecord.updatedAt = new Date();
      await this.borrowRecordRepo.update(borrowRecord);
    }

    // 5. Hoàn trả số lượng thiết bị vào kho tổng (Inventory)
    for (const item of request.items) {
      const equipment = await this.equipmentRepo.findById(item.equipmentId);
      if (equipment) {
        equipment.inventoryQuantity += item.quantity; // Cộng lại số lượng vào kho
        equipment.updatedAt = new Date();
        await this.equipmentRepo.update(equipment);
      }
    }

    // 6. Tạo thông báo thành công gửi tới sinh viên
    await this.notificationRepo.create({
      userId: request.userId,
      title: 'Trả thiết bị thành công',
      message: `Hệ thống đã ghi nhận bạn hoàn trả đầy đủ thiết bị thuộc mã yêu cầu ${borrowRequestId}.`,
      type: 'SUCCESS',
      isRead: false,
      createdAt: new Date()
    });
  }
}