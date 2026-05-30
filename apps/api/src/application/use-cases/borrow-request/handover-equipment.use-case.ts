import { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
// SỬA LỖI 1: Import đúng đường dẫn file Error
import { AppError } from '../../../domain/errors/app.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { BorrowRequestStatus, NotificationType } from '@equipment-mgmt/shared';

export interface HandoverEquipmentInput {
  borrowRequestId: number; // Đổi thành number vì DB dùng ID kiểu int
  adminId: number;
}

export class HandoverEquipmentUseCase {
  // SỬA LỖI 3: Đã gỡ bỏ borrowRecordRepo vì không cần dùng đến
  constructor(
    private borrowRequestRepo: IBorrowRequestRepository,
    private notificationRepo: INotificationRepository
  ) {}

  async execute(input: HandoverEquipmentInput): Promise<void> {
    const { borrowRequestId, adminId } = input;

    // 1. Kiểm tra sự tồn tại của phiếu yêu cầu
    const request = await this.borrowRequestRepo.findById(borrowRequestId);
    if (!request) {
      throw new NotFoundError('Không tìm thấy phiếu yêu cầu mượn thiết bị.');
    }

    // 2. Ràng buộc nghiệp vụ
    // Thay thế dòng throw mới:
    if (request.status !=BorrowRequestStatus.APPROVED) {
      throw new AppError(
        'Thiết bị chỉ có thể được bàn giao khi phiếu ở trạng thái Đã duyệt.',
        400,
        'INVALID_STATUS'
      );
    }

    // 3. SỬA LỖI 2 & 3: Lưu thời gian và người bàn giao trực tiếp vào bảng Request
    const updateData = {
      status: BorrowRequestStatus.BORROWING,
      checkoutBy: adminId,            // Tương ứng cột checkout_by trong DB
      actualCheckoutDate: new Date().toISOString(), // Tương ứng cột actual_checkout_date trong DB
      updatedAt: new Date().toISOString()
    };

    // Gọi hàm update (Tùy theo Repo nhóm bạn viết, nếu báo đỏ hãy thử đổi thành update(request))
    await this.borrowRequestRepo.update(borrowRequestId, updateData);

    // 4. SỬA LỖI 4: Đã xóa id: randomUUID() để Database tự động tăng ID
    await this.notificationRepo.create({
      userId: request.userId,
      title: 'Thiết bị đã được bàn giao',
      message: `Thiết bị trong mã yêu cầu ${borrowRequestId} đã được xuất kho và bàn giao cho bạn.`,
      type: NotificationType.CHECKOUT_CONFIRMED, // Có thể phải đổi nếu nhóm quy định Enum khác
      isRead: false,
    });
  }
}