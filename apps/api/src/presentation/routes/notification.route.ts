import { Router } from 'express';
import {
  listNotifications,
  listAllNotifications,
  markNotificationRead,
  sendManualNotification,
  getSettings,
  updateSettings,
  getRetryQueue,
  retryEmail,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize }    from '../middlewares/authorize.middleware';
import { UserRole }     from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.use(authenticate);

router.get('/', listNotifications);
router.get('/all', authorize(UserRole.ADMIN), listAllNotifications);
router.get('/settings', authorize(UserRole.ADMIN), getSettings);
router.put('/settings', authorize(UserRole.ADMIN), updateSettings);
router.get('/retry-queue', authorize(UserRole.ADMIN), getRetryQueue);
router.post('/retry-queue/:id/retry', authorize(UserRole.ADMIN), retryEmail);
router.patch('/:id/read', markNotificationRead); // id can be 'all'
router.post('/send', authorize(UserRole.ADMIN), sendManualNotification);

export default router;
