-- Migration 005: Allow multiple equipment items per borrow request
-- Adds expected_return_date to borrow_request_items so each item can have its own return date

-- Step 1: Add nullable column first (for backfill)
ALTER TABLE borrow_request_items
  ADD COLUMN IF NOT EXISTS expected_return_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Backfill from parent borrow_requests.expected_return_date
UPDATE borrow_request_items bri
  SET expected_return_date = br.expected_return_date
  FROM borrow_requests br
  WHERE bri.borrow_request_id = br.id
    AND bri.expected_return_date IS NULL;

-- Step 3: Set NOT NULL after backfill
ALTER TABLE borrow_request_items
  ALTER COLUMN expected_return_date SET NOT NULL;

-- Index for per-item overdue checks
CREATE INDEX IF NOT EXISTS idx_bri_expected_return
  ON borrow_request_items(expected_return_date)
  WHERE expected_return_date IS NOT NULL;
