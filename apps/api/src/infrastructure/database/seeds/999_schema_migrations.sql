-- Pre-populate schema_migrations so the runtime migration runner
-- knows these were already applied by Docker initdb.d
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          SERIAL PRIMARY KEY,
  filename    TEXT NOT NULL UNIQUE,
  applied_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (filename) VALUES
  ('001_initial_schema.sql'),
  ('002_borrow_request_enhancements.sql'),
  ('003_add_equipment_statuses.sql'),
  ('003_user_lock_details.sql'),
  ('004_equipment_image_and_rules.sql'),
  ('005_multi_item_borrow_request.sql'),
  ('006_single_return_date.sql')
ON CONFLICT DO NOTHING;
