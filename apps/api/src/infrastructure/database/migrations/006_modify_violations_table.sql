-- Migration 006: Make borrow_record_id nullable and add borrow_request_id to violations
ALTER TABLE violations
  ALTER COLUMN borrow_record_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS borrow_request_id INT REFERENCES borrow_requests(id) ON DELETE CASCADE;
