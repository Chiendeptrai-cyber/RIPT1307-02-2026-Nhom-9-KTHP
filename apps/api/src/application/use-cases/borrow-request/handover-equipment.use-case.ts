import { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import { IBorrowRecordRepository } from '../../../domain/repositories/borrow-record.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { AppError } from '../../../domain/errors/app.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface HandoverEquipmentInput {
  borrowRequestId: string;
  adminId: string;
}

export class HandoverEquipmentUseCase {
  constructor(
    private borrowRequestRepo: IBorrowRequestRepository,
    private borrowRecordRepo: IBorrowRecordRepository,
    private notificationRepo: INotificationRepository
  ) {}

  async execute(input: HandoverEquipmentInput): Promise<void> {
    const { borrowRequestId, adminId } = input;

    // 1. Kiểm tra sự tồn tại của phiếu yêu cầu
    const request = await this.borrowRequestRepo.findById(borrowRequestId);
    if (!request) {
      throw new NotFoundError('Không tìm thấy phiếu yêu cầu mượn thiết bị.');
    }

    // 2. Ràng buộc nghiệp vụ: Chỉ bàn giao phiếu đã được Approve trước đó
    if (request.status !== 'APPROVED') {
      throw new AppError('Thiết bị chỉ có thể được bàn giao khi phiếu ở trạng thái Đã duyệt.');
    }

    // 3. Cập nhật trạng thái phiếu sang BORROWING (Đang mượn)
    request.status = 'BORROWING';
    request.updatedAt = new Date();
    await this.borrowRequestRepo.update(request);

    // 4. Khởi tạo bản ghi mượn trả thực tế (Borrow Record) để theo dõi thời gian bàn giao
    const borrowRecord = {
      id: Crypto.randomUUID(),
      borrowRequestId,
      handedOverBy: adminId,
      handedOverAt: new Date(),
      status: 'BORROWING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.borrowRecordRepo.create(borrowRecord);

    // 5. Tạo thông báo realtime trong ứng dụng cho sinh viên
    await this.notificationRepo.create({
      id: Crypto.randomUUID(),
      userId: request.userId,
      title: 'Thiết bị đã được bàn giao',
      message: `Thiết bị trong mã yêu cầu ${borrowRequestId} đã được xuất kho và bàn giao cho bạn.`,
      type: 'INFO',
      isRead: false,
      createdAt: new Date()
    });
  }
}