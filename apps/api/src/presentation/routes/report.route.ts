import { Router } from 'express';
import { getDashboardStats, exportReport } from '../controllers/report.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { exportReportSchema } from '@equipment-mgmt/shared';
import { UserRole } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/dashboard', authorize(UserRole.ADMIN), getDashboardStats);
router.get('/export', authorize(UserRole.ADMIN), validate(exportReportSchema, 'query'), exportReport);

export default router;
