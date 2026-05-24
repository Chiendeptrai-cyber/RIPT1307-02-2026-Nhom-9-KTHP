import { Router } from 'express';
import {
  createBorrowRequest,
  listMyRequests,
  listAllRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  cancelBorrowRequest,
} from '../controllers/borrow-request.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize }    from '../middlewares/authorize.middleware';
import { validate }     from '../middlewares/validate.middleware';
import { createBorrowRequestSchema } from '@equipment-mgmt/shared';
import { UserRole } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.use(authenticate);

// Student routes
router.post('/', validate(createBorrowRequestSchema), createBorrowRequest);
router.get('/my', listMyRequests);
router.patch('/:id/cancel', cancelBorrowRequest);

// Admin routes
router.get('/', authorize(UserRole.ADMIN), listAllRequests);
router.patch('/:id/approve', authorize(UserRole.ADMIN), approveBorrowRequest);
router.patch('/:id/reject',  authorize(UserRole.ADMIN), rejectBorrowRequest);

export default router;
