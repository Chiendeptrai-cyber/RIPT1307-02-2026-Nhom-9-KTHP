import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '@equipment-mgmt/shared';

const router: import('express').Router = Router();
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;
