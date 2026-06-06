-- Migration 004: Equipment image URL + Borrow request rules acceptance

-- Allow storing an image URL for each equipment item
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Track when the student accepted the borrowing rules
ALTER TABLE borrow_requests
  ADD COLUMN IF NOT EXISTS rules_accepted_at TIMESTAMP WITH TIME ZONE;
