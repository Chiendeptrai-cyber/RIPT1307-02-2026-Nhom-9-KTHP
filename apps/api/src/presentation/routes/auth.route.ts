import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();

router.post('/login',    validate(loginSchema),    login);
router.post('/register', validate(registerSchema), register);
router.get('/me', authenticate, getMe);

export default router;
