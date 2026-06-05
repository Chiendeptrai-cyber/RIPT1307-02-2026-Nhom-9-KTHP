import { Router } from 'express';
import { listUsers, getProfile, lockUser, changePassword, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { lockUserSchema } from '@equipment-mgmt/shared';
import { UserRole } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.use(authenticate);

// Get current user profile (any authenticated user)
router.get('/me', getProfile);

// Update profile (any authenticated user)
router.patch('/me', updateProfile);

// Change password (any authenticated user)
router.patch('/me/password', changePassword);

// List all users (admin only)
router.get('/', authorize(UserRole.ADMIN), listUsers);

// Lock/unlock user (admin only)
router.put('/:id/lock', authorize(UserRole.ADMIN), validate(lockUserSchema), lockUser);

export default router;
