-- Migration 005: Add manual notification type
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'manual';
