import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();

router.post('/login',           validate(loginSchema),          login);
router.post('/register',        validate(registerSchema),       register);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  resetPassword);
router.get('/me', authenticate, getMe);

export default router;
