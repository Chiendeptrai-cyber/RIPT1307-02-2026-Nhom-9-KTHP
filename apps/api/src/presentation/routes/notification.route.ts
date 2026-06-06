import { Router } from 'express';
import {
  listNotifications,
  markNotificationRead,
  sendManualNotification,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize }    from '../middlewares/authorize.middleware';
import { UserRole }     from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.use(authenticate);

router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead); // id can be 'all'
router.post('/send', authorize(UserRole.ADMIN), sendManualNotification);

export default router;
