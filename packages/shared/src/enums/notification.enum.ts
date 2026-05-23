export enum NotificationType {
  NEW_REQUEST = 'new_request',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHECKOUT_CONFIRMED = 'checkout_confirmed',
  RETURN_CONFIRMED = 'return_confirmed',
  DUE_REMINDER = 'due_reminder',
  OVERDUE_ALERT = 'overdue_alert',
}

export enum EmailLogType {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHECKOUT_CONFIRMED = 'checkout_confirmed',
  DUE_REMINDER = 'due_reminder',
  OVERDUE_ALERT = 'overdue_alert',
}

export enum EmailSendStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}
