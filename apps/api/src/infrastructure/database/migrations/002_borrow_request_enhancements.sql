-- Migration 002: Borrow request lifecycle enhancements
-- Adds columns for tracking approval, pickup, return timestamps and display code

ALTER TABLE borrow_requests
  ADD COLUMN IF NOT EXISTS approved_at    TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS borrowed_at    TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS returned_at    TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reject_reason  TEXT,
  ADD COLUMN IF NOT EXISTS borrow_start_date TIMESTAMP WITH TIME ZONE;

-- Generated display code: PH-YYYYMMDD-XXXXX (computed view)
-- The display_code is generated in SQL via a function for queries:
-- FORMAT('PH-%s-%s', TO_CHAR(created_at, 'YYYYMMDD'), LPAD(id::TEXT, 5, '0'))

-- Index for auto-cancel scheduler queries (find approved requests older than 3 days)
CREATE INDEX IF NOT EXISTS idx_borrow_requests_approved_at ON borrow_requests(approved_at) WHERE status = 'approved';

-- Index for overdue scheduler queries
CREATE INDEX IF NOT EXISTS idx_borrow_requests_overdue ON borrow_requests(expected_return_date) WHERE status = 'borrowing';
