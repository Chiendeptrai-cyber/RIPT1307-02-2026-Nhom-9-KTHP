import { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import { IBorrowRecordRepository } from '../../../domain/repositories/borrow-record.repository';
import { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { BorrowRequestStatus, NotificationType, BorrowRecordStatus } from '@equipment-mgmt/shared';


export interface ReturnEquipmentInput {
  borrowRequestId: number; // Đổi thành number vì DB dùng ID kiểu int
  adminId: number;
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
    // Thay thế dòng throw mới:
    if (request.status !== BorrowRequestStatus.BORROWING) {
      throw new AppError(
        'Phiếu yêu cầu không ở trạng thái đang mượn thiết bị.',
        400,
        'INVALID_STATUS'
      );
    }

    // 3. Chuyển trạng thái phiếu sang RETURNED (Đã trả)
    const requestUpdateData = {
      status: BorrowRequestStatus.RETURNED,
      updatedAt: new Date().toISOString()
    };
    await this.borrowRequestRepo.update(borrowRequestId, requestUpdateData);

    // 4. Cập nhật thông tin trả đồ vào bản ghi mượn trả (Borrow Record)
    // 4. Cập nhật thông tin trả đồ vào bản ghi mượn trả (Borrow Record)
    const borrowRecord = await this.borrowRecordRepo.findByBorrowRequestId(borrowRequestId);
    if (borrowRecord) {
      const recordUpdateData = {
        // Đã xóa dòng returnedTo: adminId
        returnedAt: new Date().toISOString(),
        status: BorrowRecordStatus.RETURNED, // <--- Đổi thành BorrowRecordStatus
        updatedAt: new Date().toISOString()
      };
      await this.borrowRecordRepo.update(borrowRecord.id, recordUpdateData);
    }

    // 5. Hoàn trả số lượng thiết bị vào kho tổng (Inventory)
    if (request.items && request.items.length > 0) {
      for (const item of request.items) {
        const equipment = await this.equipmentRepo.findById(item.equipmentId);
        if (equipment) {
          const equiUpdateData = {
            availableQuantity: equipment.availableQuantity + item.quantity,
            updatedAt: new Date().toISOString()
          };
          await this.equipmentRepo.update(equipment.id, equiUpdateData);
        }
      }
    }

    // 6. Tạo thông báo thành công gửi tới sinh viên
    await this.notificationRepo.create({
      userId: request.userId,
      title: 'Trả thiết bị thành công',
      message: `Hệ thống đã ghi nhận bạn hoàn trả đầy đủ thiết bị thuộc mã yêu cầu ${borrowRequestId}.`,
      type: NotificationType.RETURN_CONFIRMED,
      isRead: false,
    });
  }
}