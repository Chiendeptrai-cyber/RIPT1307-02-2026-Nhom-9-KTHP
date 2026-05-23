import { Router } from 'express';
import { getDashboardStats, exportReport } from '../controllers/report.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/export', exportReport);

export default router;
