-- ============================================================
-- SEED: categories & equipment
-- ============================================================

-- Categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
  ('Máy tính & Laptop',       'Laptop, máy tính để bàn, thiết bị tính toán',   NOW() - INTERVAL '200 days', NOW()),
  ('Thiết bị trình chiếu',    'Máy chiếu, màn chiếu, con trỏ laser',           NOW() - INTERVAL '200 days', NOW()),
  ('Mạng & Kết nối',          'Switch, router, cáp mạng, USB hub',             NOW() - INTERVAL '200 days', NOW()),
  ('Âm thanh & Hình ảnh',     'Micro, loa, webcam, tai nghe',                  NOW() - INTERVAL '200 days', NOW()),
  ('Thiết bị đo lường',       'Đồng hồ vạn năng, oscilloscope, máy đo',        NOW() - INTERVAL '200 days', NOW()),
  ('Phụ kiện & Cáp',          'Cáp HDMI, cáp USB, adapter, bộ chuyển đổi',    NOW() - INTERVAL '200 days', NOW())
ON CONFLICT DO NOTHING;

SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));

-- ─── Equipment ───────────────────────────────────────────────
-- (category_id maps to the IDs inserted above - may differ from existing "Chung" id=1)
-- We use subqueries to be safe regardless of ID assignment

INSERT INTO equipment (name, category_id, total_quantity, available_quantity, status, description, created_at, updated_at) VALUES
  -- Laptop & Máy tính
  ('Laptop Dell XPS 13',        (SELECT id FROM categories WHERE name='Máy tính & Laptop' LIMIT 1), 5,  3, 'active',            'Laptop Dell XPS 13 siêu mỏng, Core i7-1260P, RAM 16GB, SSD 512GB, màn 13.4" FHD+',         NOW() - INTERVAL '150 days', NOW()),
  ('Laptop HP EliteBook 840',   (SELECT id FROM categories WHERE name='Máy tính & Laptop' LIMIT 1), 4,  2, 'active',            'Laptop HP EliteBook 840 G9, Core i5-1235U, RAM 8GB, SSD 256GB, màn 14" FHD',               NOW() - INTERVAL '140 days', NOW()),
  ('Laptop Lenovo ThinkPad X1', (SELECT id FROM categories WHERE name='Máy tính & Laptop' LIMIT 1), 3,  1, 'active',            'Lenovo ThinkPad X1 Carbon Gen 11, Core i7, RAM 16GB, SSD 1TB, màn 14" IPS',                NOW() - INTERVAL '130 days', NOW()),
  ('MacBook Pro M2 14"',        (SELECT id FROM categories WHERE name='Máy tính & Laptop' LIMIT 1), 2,  0, 'under_maintenance', 'MacBook Pro 14 inch chip M2 Pro, RAM 16GB, SSD 512GB – đang bảo trì',                     NOW() - INTERVAL '120 days', NOW()),
  ('Raspberry Pi 4 Model B',   (SELECT id FROM categories WHERE name='Máy tính & Laptop' LIMIT 1), 10, 7, 'active',            'Raspberry Pi 4B 4GB RAM, dùng cho thực hành IoT, lập trình nhúng',                        NOW() - INTERVAL '110 days', NOW()),

  -- Thiết bị trình chiếu
  ('Máy chiếu Epson EB-S41',    (SELECT id FROM categories WHERE name='Thiết bị trình chiếu' LIMIT 1), 4, 2, 'active',  'Máy chiếu Epson EB-S41 3300 lumens, SVGA, kết nối HDMI/VGA',                              NOW() - INTERVAL '150 days', NOW()),
  ('Máy chiếu BenQ MH560',      (SELECT id FROM categories WHERE name='Thiết bị trình chiếu' LIMIT 1), 3, 3, 'active',  'Máy chiếu BenQ MH560 Full HD 1080p, 3800 lumens, hỗ trợ 3D',                              NOW() - INTERVAL '130 days', NOW()),
  ('Màn chiếu 100 inch',        (SELECT id FROM categories WHERE name='Thiết bị trình chiếu' LIMIT 1), 6, 4, 'active',  'Màn chiếu kéo tay 100 inch, tỉ lệ 4:3, phù hợp mọi phòng học',                           NOW() - INTERVAL '120 days', NOW()),
  ('Con trỏ laser Logitech R500',(SELECT id FROM categories WHERE name='Thiết bị trình chiếu' LIMIT 1), 8, 6, 'active',  'Con trỏ laser Logitech R500, tầm xa 20m, kết nối USB receiver',                           NOW() - INTERVAL '100 days', NOW()),

  -- Mạng & Kết nối
  ('USB Hub 7 cổng Anker',     (SELECT id FROM categories WHERE name='Mạng & Kết nối' LIMIT 1), 15, 10, 'active', 'Anker USB 3.0 Hub 7 cổng có sạc nhanh 5V/4A, hỗ trợ HDD ngoài',                           NOW() - INTERVAL '140 days', NOW()),
  ('Switch mạng TP-Link 8 cổng',(SELECT id FROM categories WHERE name='Mạng & Kết nối' LIMIT 1), 5,  3, 'active', 'TP-Link TL-SG108 Gigabit 8-port switch, plug & play, không quản lý',                      NOW() - INTERVAL '130 days', NOW()),
  ('Cáp LAN Cat6 10m',          (SELECT id FROM categories WHERE name='Mạng & Kết nối' LIMIT 1), 30, 20, 'active', 'Cáp mạng Cat6 10m đúc sẵn hai đầu RJ45, băng thông 1Gbps',                                NOW() - INTERVAL '120 days', NOW()),
  ('USB-C Docking Station',     (SELECT id FROM categories WHERE name='Mạng & Kết nối' LIMIT 1), 6,  4, 'active', 'Docking station USB-C 10-in-1: HDMI 4K, USB 3.0x3, SD/TF, LAN, PD 100W',                  NOW() - INTERVAL '100 days', NOW()),

  -- Âm thanh & Hình ảnh
  ('Webcam Logitech C920',      (SELECT id FROM categories WHERE name='Âm thanh & Hình ảnh' LIMIT 1), 8, 5, 'active', 'Webcam Full HD 1080p 30fps, micro kép khử ồn, kết nối USB-A',                           NOW() - INTERVAL '130 days', NOW()),
  ('Micro cài áo Sony ECM-CS3', (SELECT id FROM categories WHERE name='Âm thanh & Hình ảnh' LIMIT 1), 12, 9, 'active','Micro kẹp ve áo Sony ECM-CS3, 3.5mm, dùng cho thuyết trình & quay video',                 NOW() - INTERVAL '120 days', NOW()),
  ('Loa Bluetooth JBL Flip 5',  (SELECT id FROM categories WHERE name='Âm thanh & Hình ảnh' LIMIT 1), 6, 4, 'active', 'Loa Bluetooth JBL Flip 5, 20W, pin 12 giờ, chống nước IPX7',                            NOW() - INTERVAL '110 days', NOW()),
  ('Headphone Sony WH-1000XM5', (SELECT id FROM categories WHERE name='Âm thanh & Hình ảnh' LIMIT 1), 4, 2, 'active', 'Tai nghe chống ồn Sony WH-1000XM5, 30h pin, kết nối Bluetooth 5.2',                     NOW() - INTERVAL '100 days', NOW()),

  -- Thiết bị đo lường
  ('Đồng hồ vạn năng Fluke 87V',(SELECT id FROM categories WHERE name='Thiết bị đo lường' LIMIT 1), 10, 7, 'active',  'Đồng hồ vạn năng Fluke 87V True-RMS, đo điện áp, dòng điện, tần số',                    NOW() - INTERVAL '150 days', NOW()),
  ('Oscilloscope Rigol DS1054Z', (SELECT id FROM categories WHERE name='Thiết bị đo lường' LIMIT 1), 4,  2, 'active',  'Oscilloscope 4 kênh 50MHz, 1GSa/s, màn 7" TFT, dùng thực hành điện tử',                  NOW() - INTERVAL '140 days', NOW()),
  ('Bộ nguồn DC thí nghiệm',    (SELECT id FROM categories WHERE name='Thiết bị đo lường' LIMIT 1), 8,  5, 'active',  'Nguồn DC điều chỉnh 0-30V/0-5A, hiển thị LED kép, 2 kênh độc lập',                       NOW() - INTERVAL '130 days', NOW()),

  -- Phụ kiện & Cáp
  ('Cáp HDMI 2.1 2m',           (SELECT id FROM categories WHERE name='Phụ kiện & Cáp' LIMIT 1), 25, 18, 'active',  'Cáp HDMI 2.1 hỗ trợ 8K@60Hz, 4K@120Hz, dài 2m, có băng thông 48Gbps',                   NOW() - INTERVAL '120 days', NOW()),
  ('Cáp USB-C sang HDMI',       (SELECT id FROM categories WHERE name='Phụ kiện & Cáp' LIMIT 1), 20, 14, 'active',  'Cáp chuyển đổi USB-C sang HDMI 4K@60Hz, dài 1.8m, tương thích Thunderbolt 3/4',          NOW() - INTERVAL '110 days', NOW()),
  ('Adapter sạc laptop 65W',    (SELECT id FROM categories WHERE name='Phụ kiện & Cáp' LIMIT 1), 15, 11, 'active',  'Adapter GaN 65W USB-C, hỗ trợ PD 3.0, QC 4+, nhỏ gọn, 3 cổng đầu ra',                   NOW() - INTERVAL '100 days', NOW()),
  ('Bàn phím cơ Keychron K2',   (SELECT id FROM categories WHERE name='Phụ kiện & Cáp' LIMIT 1), 5,  3, 'active',  'Bàn phím cơ Keychron K2 75%, switch Gateron Red, kết nối Bluetooth & USB-C',              NOW() - INTERVAL '90 days',  NOW()),
  ('Chuột không dây Logitech MX',(SELECT id FROM categories WHERE name='Phụ kiện & Cáp' LIMIT 1), 8,  5, 'active',  'Chuột Logitech MX Master 3S, 8000 DPI, Bluetooth & USB, pin 70 ngày',                    NOW() - INTERVAL '80 days',  NOW())
ON CONFLICT DO NOTHING;

SELECT setval('equipment_id_seq', (SELECT COALESCE(MAX(id), 1) FROM equipment));
