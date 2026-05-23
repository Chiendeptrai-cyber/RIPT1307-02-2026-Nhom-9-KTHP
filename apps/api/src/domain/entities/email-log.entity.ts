import { EmailLogType, EmailSendStatus } from '@equipment-mgmt/shared';

export interface EmailLogEntity {
  id: number;
  userId: number;
  type: EmailLogType;
  status: EmailSendStatus;
  subject: string;
  recipient: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
