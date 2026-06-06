import type { Request, Response } from 'express';
import {
  listNotificationsUseCase,
  markNotificationReadUseCase,
  notificationRepo,
  userRepo,
} from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { page = '1', pageSize = '20' } = req.query as Record<string, string>;

  const result = await listNotificationsUseCase.execute(userId, Number(page), Number(pageSize));

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id }  = req.params;

  const result = await markNotificationReadUseCase.execute(
    id === 'all' ? 'all' : Number(id),
    userId,
  );

  res.json({
    success: true,
    data: result,
    message: 'OK',
  } satisfies ApiResponse);
}

export async function sendManualNotification(req: Request, res: Response): Promise<void> {
  const { target, title, content } = req.body as {
    target: 'all_students' | 'overdue' | 'admin';
    title: string;
    content: string;
  };

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc' });
    return;
  }

  // Tìm danh sách userId theo target
  let targetUsers: number[] = [];

  if (target === 'all_students') {
    const { items } = await (userRepo as any).findAll({ page: 1, pageSize: 1000, role: 'student' });
    targetUsers = items.map((u: any) => u.id);
  } else if (target === 'admin') {
    const { items } = await (userRepo as any).findAll({ page: 1, pageSize: 100, role: 'admin' });
    targetUsers = items.map((u: any) => u.id);
  } else if (target === 'overdue') {
    // Sinh viên có phiếu quá hạn
    const pool = (notificationRepo as any).pool;
    const result = await pool.query(
      `SELECT DISTINCT br.user_id FROM borrow_requests br
       WHERE br.status IN ('overdue', 'borrowing') AND br.expected_return_date < NOW()`,
    );
    targetUsers = result.rows.map((r: any) => r.user_id);
  }

  if (targetUsers.length === 0) {
    res.json({ success: true, data: { sent: 0 }, message: 'Không có người nhận phù hợp' });
    return;
  }

  // Tạo thông báo cho từng user
  await Promise.all(
    targetUsers.map((userId) =>
      notificationRepo.create({
        userId,
        type: 'manual' as any,
        title: title.trim(),
        message: content.trim(),
        isRead: false,
      }),
    ),
  );

  res.json({
    success: true,
    data: { sent: targetUsers.length },
    message: `Đã gửi thông báo đến ${targetUsers.length} người dùng`,
  } satisfies ApiResponse);
}

