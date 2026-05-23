export enum BorrowRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  BORROWING = 'borrowing',
  OVERDUE = 'overdue',
  UNDER_REVIEW = 'under_review',
  RETURNED = 'returned',
}

export enum BorrowRecordStatus {
  BORROWED = 'borrowed',
  PARTIAL_RETURNED = 'partial_returned',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}

export enum ViolationType {
  LATE_RETURN = 'late_return',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export enum StockActionType {
  IMPORT = 'import',
  MARK_DAMAGED = 'mark_damaged',
  MARK_LOST = 'mark_lost',
  REPAIRED = 'repaired',
  ADJUSTMENT = 'adjustment',
  BORROW_APPROVE = 'borrow_approve',
  BORROW_RETURN = 'borrow_return',
  BORROW_CANCEL = 'borrow_cancel',
}
