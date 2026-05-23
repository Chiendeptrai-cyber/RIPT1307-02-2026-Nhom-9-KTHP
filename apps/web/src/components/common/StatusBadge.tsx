import { Tag } from 'antd';
import { BorrowRequestStatus } from '@equipment-mgmt/shared';

const STATUS_CONFIG: Record<BorrowRequestStatus, { color: string; label: string }> = {
  [BorrowRequestStatus.PENDING]: { color: 'gold', label: 'Chờ duyệt' },
  [BorrowRequestStatus.APPROVED]: { color: 'blue', label: 'Đã duyệt' },
  [BorrowRequestStatus.BORROWING]: { color: 'orange', label: 'Đang mượn' },
  [BorrowRequestStatus.OVERDUE]: { color: 'red', label: 'Quá hạn' },
  [BorrowRequestStatus.UNDER_REVIEW]: { color: 'purple', label: 'Đang kiểm tra' },
  [BorrowRequestStatus.RETURNED]: { color: 'default', label: 'Đã trả' },
  [BorrowRequestStatus.REJECTED]: { color: 'error', label: 'Từ chối' },
  [BorrowRequestStatus.CANCELLED]: { color: 'default', label: 'Đã hủy' },
};

interface Props {
  status: BorrowRequestStatus;
}

export function StatusBadge({ status }: Props) {
  const { color, label } = STATUS_CONFIG[status] ?? { color: 'default', label: status };
  return <Tag color={color}>{label}</Tag>;
}
