import { Router } from 'express';
import {
  createBorrowRequest,
  listMyRequests,
  listAllRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  cancelBorrowRequest,
  markReceived,
  markNotReceived,
  markReturned,
  handover,
  returnEquipment,
} from '../controllers/borrow-request.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createBorrowRequestSchema, UserRole } from '@equipment-mgmt/shared';

const router: Router = Router();
router.use(authenticate); // Tất cả route đều cần login

// 1. Student routes
router.post('/', validate(createBorrowRequestSchema), createBorrowRequest);
router.get('/my', listMyRequests);
router.patch('/:id/cancel', cancelBorrowRequest);

// 2. Admin routes
router.get('/', authorize(UserRole.ADMIN), listAllRequests);
router.patch('/:id/approve', authorize(UserRole.ADMIN), approveBorrowRequest);
router.patch('/:id/reject', authorize(UserRole.ADMIN), rejectBorrowRequest);
router.patch('/:id/mark-received', authorize(UserRole.ADMIN), markReceived);
router.patch('/:id/mark-not-received', authorize(UserRole.ADMIN), markNotReceived);
router.patch('/:id/mark-returned', authorize(UserRole.ADMIN), markReturned);

// THÊM MỚI TẠI ĐÂY: Sử dụng UserRole.ADMIN cho đồng bộ
router.post('/:id/handover', authorize(UserRole.ADMIN), handover);
router.post('/:id/return', authorize(UserRole.ADMIN), returnEquipment);

export default router;