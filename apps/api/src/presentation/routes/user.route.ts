import { Router } from 'express';
import { listUsers, getProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', listUsers);
router.get('/me', getProfile);

export default router;
