import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email không đúng định dạng!' }),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự!' }),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, { message: 'Họ tên phải có ít nhất 3 ký tự!' }),
  email: z.string().email({ message: 'Email không đúng định dạng!' }),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự!' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email không đúng định dạng!' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid({ message: 'Mã xác thực không hợp lệ!' }),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự!' }),
});
