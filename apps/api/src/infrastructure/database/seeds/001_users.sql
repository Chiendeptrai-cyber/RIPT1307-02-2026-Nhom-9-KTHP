-- ============================================================
-- SEED: users
-- password hash = bcrypt('password', 10)
-- hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================

INSERT INTO users (full_name, email, password_hash, role, status, created_at, updated_at) VALUES
  -- Admins
  ('Admin PTIT',         'admin@ptit.edu.vn',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',   'active',         NOW() - INTERVAL '180 days', NOW()),
  ('Nguyễn Văn Quản',   'quanly@ptit.edu.vn',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',   'active',         NOW() - INTERVAL '170 days', NOW()),

  -- Students - active
  ('Trần Minh Chien',   'chien@ptit.edu.vn',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '120 days', NOW()),
  ('Lê Thị Hoa',        'hoa.le@ptit.edu.vn',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '115 days', NOW()),
  ('Phạm Quốc Bảo',     'bao.pham@ptit.edu.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '100 days', NOW()),
  ('Nguyễn Thị Lan',    'lan.nguyen@ptit.edu.vn',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '90 days',  NOW()),
  ('Đặng Hoàng Nam',    'nam.dang@ptit.edu.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '85 days',  NOW()),
  ('Vũ Thanh Tùng',     'tung.vu@ptit.edu.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '80 days',  NOW()),
  ('Bùi Thị Mai',       'mai.bui@ptit.edu.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '75 days',  NOW()),
  ('Hoàng Văn Đức',     'duc.hoang@ptit.edu.vn',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '70 days',  NOW()),
  ('Trịnh Thị Ngọc',    'ngoc.trinh@ptit.edu.vn',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '60 days',  NOW()),
  ('Đinh Văn Long',     'long.dinh@ptit.edu.vn',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '55 days',  NOW()),
  ('Phan Thị Thu',      'thu.phan@ptit.edu.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active',         NOW() - INTERVAL '50 days',  NOW()),

  -- Students - locked
  ('Lý Văn Tài',        'tai.ly@ptit.edu.vn',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'locked', NOW() - INTERVAL '40 days',  NOW()),
  ('Cao Thị Bích',      'bich.cao@ptit.edu.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'locked',         NOW() - INTERVAL '30 days',  NOW())
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
