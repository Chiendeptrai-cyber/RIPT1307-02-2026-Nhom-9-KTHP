import { Router } from 'express';
import { listNotifications, markNotificationRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
