import type { Request, Response } from 'express';
import { loginUseCase, registerUseCase } from '../../infrastructure/container';

export async function login(req: Request, res: Response): Promise<void> {
  const result = await loginUseCase.execute(req.body);
  res.json({ success: true, data: result, message: 'Logged in' });
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await registerUseCase.execute(req.body);
  res.json({ success: true, data: result, message: 'Registered' });
}
