import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import type { ApiResponse } from '@equipment-mgmt/shared';
import { UserRole, UserStatus } from '@equipment-mgmt/shared';
import { BadRequestError } from '../../domain/errors/bad-request.error';
import {
  listUsersUseCase,
  lockUserUseCase,
  getUserProfileUseCase,
  changePasswordUseCase,
  updateProfileUseCase,
  userRepo,
  violationRepo,
} from '../../infrastructure/container';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { page = 1, pageSize = 20, role, status } = req.query;
  
  // Validate role parameter if provided
  let validRole: UserRole | undefined;
  if (role && Object.values(UserRole).includes(role as UserRole)) {
    validRole = role as UserRole;
  }

  // Validate status parameter if provided
  let validStatus: UserStatus | undefined;
  if (status && Object.values(UserStatus).includes(status as UserStatus)) {
    validStatus = status as UserStatus;
  }

  const result = await listUsersUseCase.execute({
    userId: req.user!.userId,
    userRole: req.user!.role as UserRole,
    page: Number(page),
    pageSize: Number(pageSize),
    role: validRole,
    status: validStatus,
  });

  res.json({
    success: true,
    data: result,
    message: 'Users list retrieved',
  } satisfies ApiResponse);
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const result = await getUserProfileUseCase.execute({
    userId: req.user!.userId,
  });

  res.json({
    success: true,
    data: result,
    message: 'Profile loaded',
  } satisfies ApiResponse);
}

export async function lockUser(req: Request, res: Response): Promise<void> {
  const { targetUserId, newStatus, reason } = req.body;

  const result = await lockUserUseCase.execute({
    adminId: req.user!.userId,
    adminRole: req.user!.role as UserRole,
    targetUserId,
    newStatus,
    reason,
  });

  res.json({
    success: true,
    data: result,
    message: 'User status updated successfully',
  } satisfies ApiResponse);
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;

  await changePasswordUseCase.execute({
    userId: req.user!.userId,
    currentPassword,
    newPassword,
  });

  res.json({
    success: true,
    data: null,
    message: 'Đổi mật khẩu thành công',
  } satisfies ApiResponse);
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { fullName, email, phoneNumber, avatar } = req.body;

  let avatarUrl: string | undefined = undefined;

  if (avatar) {
    const matches = avatar.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG/PNG');
    }
    const ext = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    if (dataBuffer.length > 2 * 1024 * 1024) {
      throw new BadRequestError('Kích thước ảnh không được vượt quá 2MB');
    }

    const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean up old avatar if exists
    const user = await userRepo.findById(req.user!.userId);
    if (user && user.avatarUrl) {
      const oldFileName = user.avatarUrl.substring(user.avatarUrl.lastIndexOf('/') + 1);
      const oldFilePath = path.join(uploadDir, oldFileName);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.error('Failed to delete old avatar', e);
        }
      }
    }

    const fileName = `avatar-${req.user!.userId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, dataBuffer);
    avatarUrl = `/api/v1/uploads/${fileName}`;
  }

  const result = await updateProfileUseCase.execute({
    userId: req.user!.userId,
    fullName,
    email,
    phoneNumber,
    avatarUrl,
  });

  res.json({
    success: true,
    data: result,
    message: 'Cập nhật thông tin thành công',
  } satisfies ApiResponse);
}

export async function listViolations(req: Request, res: Response): Promise<void> {
  const userId = Number(req.params.id);
  const result = await (violationRepo as any).listByUser(userId);

  res.json({
    success: true,
    data: result,
    message: 'Lấy danh sách vi phạm thành công',
  } satisfies ApiResponse);
}
