-- Migration 006: Move expected_return_date to request level only.
-- All items in a borrow request share one return date; no per-item dates needed.

-- Drop the per-item date index
DROP INDEX IF EXISTS idx_bri_expected_return;

-- Drop the per-item date column
ALTER TABLE borrow_request_items
  DROP COLUMN IF EXISTS expected_return_date;
