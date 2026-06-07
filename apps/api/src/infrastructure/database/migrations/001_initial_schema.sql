CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'locked');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_status') THEN
    CREATE TYPE equipment_status AS ENUM ('active', 'under_maintenance', 'damaged', 'discontinued', 'deleted');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instance_condition') THEN
    CREATE TYPE instance_condition AS ENUM ('good', 'reserved', 'borrowed', 'damaged', 'lost', 'under_repair');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'borrow_request_status') THEN
    CREATE TYPE borrow_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'borrowing', 'overdue', 'under_review', 'returned');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'borrow_record_status') THEN
    CREATE TYPE borrow_record_status AS ENUM ('borrowed', 'partial_returned', 'returned', 'overdue');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'violation_type') THEN
    CREATE TYPE violation_type AS ENUM ('late_return', 'damaged', 'lost');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_action_type') THEN
    CREATE TYPE stock_action_type AS ENUM ('import', 'mark_damaged', 'mark_lost', 'repaired', 'adjustment', 'borrow_approve', 'borrow_return', 'borrow_cancel');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('new_request', 'approved', 'rejected', 'checkout_confirmed', 'return_confirmed', 'due_reminder', 'overdue_alert');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_log_type') THEN
    CREATE TYPE email_log_type AS ENUM ('approved', 'rejected', 'checkout_confirmed', 'due_reminder', 'overdue_alert');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_send_status') THEN
    CREATE TYPE email_send_status AS ENUM ('pending', 'sent', 'failed');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  total_quantity INT NOT NULL,
  available_quantity INT NOT NULL,
  status equipment_status NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_instances (
  id SERIAL PRIMARY KEY,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  condition instance_condition NOT NULL DEFAULT 'good',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS borrow_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status borrow_request_status NOT NULL DEFAULT 'pending',
  expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS borrow_request_items (
  id SERIAL PRIMARY KEY,
  borrow_request_id INT NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  quantity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS borrow_records (
  id SERIAL PRIMARY KEY,
  borrow_request_id INT NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
  status borrow_record_status NOT NULL DEFAULT 'borrowed',
  borrowed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS borrow_record_instances (
  id SERIAL PRIMARY KEY,
  borrow_record_id INT NOT NULL REFERENCES borrow_records(id) ON DELETE CASCADE,
  equipment_instance_id INT NOT NULL REFERENCES equipment_instances(id) ON DELETE RESTRICT,
  returned_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrow_record_id INT NOT NULL REFERENCES borrow_records(id) ON DELETE CASCADE,
  type violation_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_stock_logs (
  id SERIAL PRIMARY KEY,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  action stock_action_type NOT NULL,
  quantity INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type email_log_type NOT NULL,
  status email_send_status NOT NULL DEFAULT 'pending',
  subject TEXT NOT NULL,
  recipient TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_user_id ON borrow_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_equipment_stock_logs_equipment_id ON equipment_stock_logs(equipment_id);

-- Seed: danh mục mặc định
INSERT INTO categories (id, name, description)
VALUES (1, 'Chung', 'Danh mục mặc định')
ON CONFLICT (id) DO NOTHING;
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));

-- Seed: tài khoản admin mặc định (password: password)
INSERT INTO users (full_name, email, password_hash, role, status)
VALUES (
  'Admin PTIT',
  'admin@ptit.edu.vn',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;


