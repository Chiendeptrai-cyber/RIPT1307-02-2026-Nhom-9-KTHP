import { Router } from 'express';
import authRouter from './auth.route';
import equipmentRouter from './equipment.route';
import borrowRequestRouter from './borrow-request.route';
import notificationRouter from './notification.route';
import reportRouter from './report.route';
import userRouter from './user.route';

export const router: import('express').Router = Router();
router.use('/auth', authRouter);
router.use('/equipment', equipmentRouter);
router.use('/borrow-requests', borrowRequestRouter);
router.use('/notifications', notificationRouter);
router.use('/reports', reportRouter);
router.use('/users', userRouter);
