-- Migration 003: User account lock details
-- Stores lock reason, timestamp, and which admin locked the account

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS lock_reason TEXT,
  ADD COLUMN IF NOT EXISTS locked_at   TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS locked_by   INT REFERENCES users(id) ON DELETE SET NULL;

-- Clear lock info when account is unlocked (handled in application layer)
-- Index to quickly find accounts locked by a specific admin
CREATE INDEX IF NOT EXISTS idx_users_locked_by ON users(locked_by) WHERE locked_by IS NOT NULL;
