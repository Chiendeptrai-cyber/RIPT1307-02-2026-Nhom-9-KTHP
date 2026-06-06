export enum SystemLogAction {
  APPROVE_REQUEST = 'approve_request',
  REJECT_REQUEST = 'reject_request',
  CANCEL_REQUEST = 'cancel_request',
  UPDATE_EQUIPMENT = 'update_equipment',
  LOCK_ACCOUNT = 'lock_account',
  UNLOCK_ACCOUNT = 'unlock_account',
  STOCK_IMPORT = 'stock_import',
  STOCK_MARK_DAMAGED = 'stock_mark_damaged',
  STOCK_MARK_LOST = 'stock_mark_lost',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_STATUS_CHANGE = 'stock_status_change',
}

export type SystemLogCategory = 'approval' | 'equipment' | 'account' | 'stock';
