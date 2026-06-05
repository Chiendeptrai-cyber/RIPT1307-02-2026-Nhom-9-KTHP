CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'borrow_blocked', 'locked');
CREATE TYPE equipment_status AS ENUM ('active', 'under_maintenance', 'deleted');
CREATE TYPE instance_condition AS ENUM ('good', 'reserved', 'borrowed', 'damaged', 'lost', 'under_repair');
CREATE TYPE borrow_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'borrowing', 'overdue', 'under_review', 'returned');
CREATE TYPE borrow_record_status AS ENUM ('borrowed', 'partial_returned', 'returned', 'overdue');
CREATE TYPE violation_type AS ENUM ('late_return', 'damaged', 'lost');
CREATE TYPE stock_action_type AS ENUM ('import', 'mark_damaged', 'mark_lost', 'repaired', 'adjustment', 'borrow_approve', 'borrow_return', 'borrow_cancel');
CREATE TYPE notification_type AS ENUM ('new_request', 'approved', 'rejected', 'checkout_confirmed', 'return_confirmed', 'due_reminder', 'overdue_alert');
CREATE TYPE email_log_type AS ENUM ('approved', 'rejected', 'checkout_confirmed', 'due_reminder', 'overdue_alert');
CREATE TYPE email_send_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  total_quantity INT NOT NULL,
  available_quantity INT NOT NULL,
  status equipment_status NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment_instances (
  id SERIAL PRIMARY KEY,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  condition instance_condition NOT NULL DEFAULT 'good',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE borrow_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status borrow_request_status NOT NULL DEFAULT 'pending',
  expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE borrow_request_items (
  id SERIAL PRIMARY KEY,
  borrow_request_id INT NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  quantity INT NOT NULL
);

CREATE TABLE borrow_records (
  id SERIAL PRIMARY KEY,
  borrow_request_id INT NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
  status borrow_record_status NOT NULL DEFAULT 'borrowed',
  borrowed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE borrow_record_instances (
  id SERIAL PRIMARY KEY,
  borrow_record_id INT NOT NULL REFERENCES borrow_records(id) ON DELETE CASCADE,
  equipment_instance_id INT NOT NULL REFERENCES equipment_instances(id) ON DELETE RESTRICT,
  returned_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE violations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrow_record_id INT NOT NULL REFERENCES borrow_records(id) ON DELETE CASCADE,
  type violation_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment_stock_logs (
  id SERIAL PRIMARY KEY,
  equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  action stock_action_type NOT NULL,
  quantity INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE email_logs (
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

CREATE INDEX idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX idx_borrow_requests_user_id ON borrow_requests(user_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_equipment_stock_logs_equipment_id ON equipment_stock_logs(equipment_id);

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

-- Seed: equipment sample
INSERT INTO equipment (name, category_id, total_quantity, available_quantity, status, description, created_at, updated_at)
VALUES 
  ('Laptop Dell XPS 13', 1, 5, 3, 'active', 'Laptop del XPS siêu nhẹ, màn hình 13 inch FHD', NOW(), NOW()),
  ('Máy chiếu Epson', 1, 3, 2, 'active', 'Máy chiếu LED 3000 lumens cho phòng học', NOW(), NOW()),
  ('USB Hub 7 cổng', 1, 10, 8, 'active', 'Hub USB 3.0 với sạc nhanh', NOW(), NOW()),
  ('Cáp HDMI 2.1', 1, 20, 15, 'active', 'Cáp HDMI 2.1 hỗ trợ 8K', NOW(), NOW()),
  ('Webcam Logitech', 1, 8, 6, 'active', 'Webcam Full HD 30fps', NOW(), NOW())
ON CONFLICT DO NOTHING;
SELECT setval('equipment_id_seq', (SELECT COALESCE(MAX(id), 1) FROM equipment));

-- Seed: equipment instances
INSERT INTO equipment_instances (equipment_id, serial_number, condition, created_at, updated_at)
VALUES 
  (1, 'DELL-XPS-001', 'good', NOW(), NOW()),
  (1, 'DELL-XPS-002', 'good', NOW(), NOW()),
  (1, 'DELL-XPS-003', 'good', NOW(), NOW()),
  (1, 'DELL-XPS-004', 'good', NOW(), NOW()),
  (1, 'DELL-XPS-005', 'good', NOW(), NOW()),
  (2, 'EPSON-001', 'good', NOW(), NOW()),
  (2, 'EPSON-002', 'good', NOW(), NOW()),
  (2, 'EPSON-003', 'good', NOW(), NOW()),
  (3, 'USB-HUB-001', 'good', NOW(), NOW()),
  (3, 'USB-HUB-002', 'good', NOW(), NOW()),
  (3, 'USB-HUB-003', 'good', NOW(), NOW()),
  (3, 'USB-HUB-004', 'good', NOW(), NOW()),
  (3, 'USB-HUB-005', 'good', NOW(), NOW()),
  (3, 'USB-HUB-006', 'good', NOW(), NOW()),
  (3, 'USB-HUB-007', 'good', NOW(), NOW()),
  (3, 'USB-HUB-008', 'good', NOW(), NOW()),
  (3, 'USB-HUB-009', 'good', NOW(), NOW()),
  (3, 'USB-HUB-010', 'good', NOW(), NOW()),
  (4, 'HDMI-001', 'good', NOW(), NOW()),
  (4, 'HDMI-002', 'good', NOW(), NOW()),
  (4, 'HDMI-003', 'good', NOW(), NOW()),
  (4, 'HDMI-004', 'good', NOW(), NOW()),
  (4, 'HDMI-005', 'good', NOW(), NOW()),
  (4, 'HDMI-006', 'good', NOW(), NOW()),
  (4, 'HDMI-007', 'good', NOW(), NOW()),
  (4, 'HDMI-008', 'good', NOW(), NOW()),
  (4, 'HDMI-009', 'good', NOW(), NOW()),
  (4, 'HDMI-010', 'good', NOW(), NOW()),
  (4, 'HDMI-011', 'good', NOW(), NOW()),
  (4, 'HDMI-012', 'good', NOW(), NOW()),
  (4, 'HDMI-013', 'good', NOW(), NOW()),
  (4, 'HDMI-014', 'good', NOW(), NOW()),
  (4, 'HDMI-015', 'good', NOW(), NOW()),
  (4, 'HDMI-016', 'good', NOW(), NOW()),
  (4, 'HDMI-017', 'good', NOW(), NOW()),
  (4, 'HDMI-018', 'good', NOW(), NOW()),
  (4, 'HDMI-019', 'good', NOW(), NOW()),
  (4, 'HDMI-020', 'good', NOW(), NOW()),
  (5, 'WEBCAM-001', 'good', NOW(), NOW()),
  (5, 'WEBCAM-002', 'good', NOW(), NOW()),
  (5, 'WEBCAM-003', 'good', NOW(), NOW()),
  (5, 'WEBCAM-004', 'good', NOW(), NOW()),
  (5, 'WEBCAM-005', 'good', NOW(), NOW()),
  (5, 'WEBCAM-006', 'good', NOW(), NOW()),
  (5, 'WEBCAM-007', 'good', NOW(), NOW()),
  (5, 'WEBCAM-008', 'good', NOW(), NOW())
ON CONFLICT DO NOTHING;
SELECT setval('equipment_instances_id_seq', (SELECT COALESCE(MAX(id), 1) FROM equipment_instances));


