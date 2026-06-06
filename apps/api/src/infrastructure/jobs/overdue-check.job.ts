import { borrowRequestRepo, notificationRepo, violationRepo } from '../container';
import { BorrowRequestStatus, NotificationType, ViolationType } from '@equipment-mgmt/shared';

export async function overdueCheckJob(): Promise<void> {
  console.log('🔄 Running overdue check job...');
  try {
    const overdueRequests = await borrowRequestRepo.findOverdueBorrowingRequests();
    if (overdueRequests.length === 0) {
      console.log('✅ No overdue requests found.');
      return;
    }

    for (const req of overdueRequests) {
      // 1. Update status to overdue
      await borrowRequestRepo.update(req.id, {
        status: BorrowRequestStatus.OVERDUE,
      });

      // 2. Create a violation
      await violationRepo.create({
        userId: req.userId,
        borrowRequestId: req.id,
        type: ViolationType.LATE_RETURN,
        description: `Quá hạn trả thiết bị. Hạn trả: ${new Date(req.expectedReturnDate).toLocaleDateString('vi-VN')}`,
      });

      // 3. Send notification
      await notificationRepo.create({
        userId: req.userId,
        type: NotificationType.WARNING,
        title: 'Cảnh báo quá hạn trả thiết bị',
        message: `Phiếu mượn #${req.id} đã quá hạn trả. Một vi phạm trả muộn đã được ghi nhận. Vui lòng hoàn trả thiết bị ngay lập tức!`,
        isRead: false,
      });
      
      console.log(`⚠️ Marked request #${req.id} as OVERDUE and created violation.`);
    }
  } catch (error) {
    console.error('❌ Failed to run overdue check job:', error);
  }
}
