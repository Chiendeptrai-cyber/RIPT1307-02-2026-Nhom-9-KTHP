import type { Request, Response } from 'express';
import { loginUseCase, registerUseCase, forgotPasswordUseCase, resetPasswordUseCase, userRepo } from '../../infrastructure/container';
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

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };
  const result = await forgotPasswordUseCase.execute({ email });

  res.json({
    success: true,
    data: result,
    message: 'Mã đặt lại mật khẩu đã được gửi',
  } satisfies ApiResponse);
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token: string; password: string };
  await resetPasswordUseCase.execute({ token, passwordStr: password });

  res.json({
    success: true,
    data: null,
    message: 'Đặt lại mật khẩu thành công',
  } satisfies ApiResponse);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userRepo.findById(req.user!.userId);
  res.json({
    success: true,
    data: user
      ? { userId: user.id, role: user.role, fullName: user.fullName, email: user.email }
      : req.user,
    message: 'OK',
  } satisfies ApiResponse);
}
