import { Router } from 'express';
import { createBorrowRequest, listBorrowRequests } from '../controllers/borrow-request.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createBorrowRequestSchema } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.use(authenticate);
router.post('/', validate(createBorrowRequestSchema), createBorrowRequest);
router.get('/', listBorrowRequests);

export default router;
