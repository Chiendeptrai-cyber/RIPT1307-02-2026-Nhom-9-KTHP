import { BorrowRequestStatus } from '@equipment-mgmt/shared';

// Import cái file chứa BorrowRequestItem mà bạn vừa gửi lúc nãy
import type { BorrowRequestItemEntity } from './borrow-request-item.entity'; 

export interface BorrowRequestEntity {
  id: number;
  userId: number;
  status: BorrowRequestStatus;
  expectedReturnDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Đây là dòng quan trọng nhất để sửa cái lỗi đỏ "items" ở file Return:
  items?: BorrowRequestItemEntity[]; 
}