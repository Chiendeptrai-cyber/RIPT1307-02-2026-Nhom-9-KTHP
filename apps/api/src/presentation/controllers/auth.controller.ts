import type { Request, Response } from 'express';
import { loginUseCase, registerUseCase } from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const result = await loginUseCase.execute({ email, password });

  res.json({
    success: true,
    data: result,
    message: 'Đăng nhập thành công',
  } satisfies ApiResponse);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { fullName, email, password } = req.body as {
    fullName: string;
    email: string;
    password: string;
  };
  const result = await registerUseCase.execute({ fullName, email, password });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Đăng ký tài khoản thành công',
  } satisfies ApiResponse);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: req.user,
    message: 'OK',
  } satisfies ApiResponse);
}
