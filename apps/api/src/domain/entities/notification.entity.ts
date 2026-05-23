import { NotificationType } from '@equipment-mgmt/shared';

export interface NotificationEntity {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
