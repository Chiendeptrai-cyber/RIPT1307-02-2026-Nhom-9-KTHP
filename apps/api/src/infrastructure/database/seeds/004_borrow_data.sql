-- ============================================================
-- SEED: borrow_requests, borrow_request_items, borrow_records, borrow_record_instances
-- Tạo lịch sử mượn đa dạng: pending, approved, borrowing, returned, overdue, rejected
-- ============================================================

-- ─── Helper: resolve user & equipment IDs ─────────────────────
-- student IDs: chien=3, hoa=4, bao=5, lan=6, nam=7, tung=8, mai=9, duc=10, ngoc=11, long=12, thu=13

-- ─── 1. RETURNED requests (hoàn thành) ───────────────────────

-- Request #1: Chien mượn Laptop Dell + Webcam -> đã trả
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='chien@ptit.edu.vn'),
  'returned',
  NOW() - INTERVAL '50 days',
  'Dùng cho đồ án môn KTMT',
  NOW() - INTERVAL '70 days',
  NOW() - INTERVAL '50 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Laptop Dell XPS 13' LIMIT 1), 1, NOW() - INTERVAL '50 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Webcam Logitech C920' LIMIT 1), 1, NOW() - INTERVAL '50 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'returned',
  NOW() - INTERVAL '68 days',
  NOW() - INTERVAL '50 days',
  NOW() - INTERVAL '52 days',
  NOW() - INTERVAL '68 days',
  NOW() - INTERVAL '52 days'
);

-- Request #2: Hoa mượn Máy chiếu + Màn chiếu -> đã trả
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='hoa.le@ptit.edu.vn'),
  'returned',
  NOW() - INTERVAL '40 days',
  'Thuyết trình môn KTPM',
  NOW() - INTERVAL '55 days',
  NOW() - INTERVAL '40 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Máy chiếu Epson EB-S41' LIMIT 1), 1, NOW() - INTERVAL '40 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Màn chiếu 100 inch' LIMIT 1), 1, NOW() - INTERVAL '40 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'returned',
  NOW() - INTERVAL '53 days',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '42 days',
  NOW() - INTERVAL '53 days',
  NOW() - INTERVAL '42 days'
);

-- Request #3: Bao mượn USB Hub + Cáp HDMI -> đã trả
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='bao.pham@ptit.edu.vn'),
  'returned',
  NOW() - INTERVAL '30 days',
  'Kết nối thiết bị phòng lab',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '30 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='USB Hub 7 cổng Anker' LIMIT 1), 2, NOW() - INTERVAL '30 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Cáp HDMI 2.1 2m' LIMIT 1), 3, NOW() - INTERVAL '30 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'returned',
  NOW() - INTERVAL '44 days',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '31 days',
  NOW() - INTERVAL '44 days',
  NOW() - INTERVAL '31 days'
);

-- ─── 2. BORROWING requests (đang mượn) ───────────────────────

-- Request #4: Lan đang mượn Laptop HP
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='lan.nguyen@ptit.edu.vn'),
  'borrowing',
  NOW() + INTERVAL '5 days',
  'Thực hành môn CTDLGT',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '8 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Laptop HP EliteBook 840' LIMIT 1), 1, NOW() + INTERVAL '5 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'borrowed',
  NOW() - INTERVAL '8 days',
  NOW() + INTERVAL '5 days',
  NULL,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
);

-- Request #5: Nam đang mượn Oscilloscope + Đồng hồ vạn năng
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='nam.dang@ptit.edu.vn'),
  'borrowing',
  NOW() + INTERVAL '3 days',
  'Thí nghiệm điện tử tương tự',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '5 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Oscilloscope Rigol DS1054Z' LIMIT 1), 1, NOW() + INTERVAL '3 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Đồng hồ vạn năng Fluke 87V' LIMIT 1), 1, NOW() + INTERVAL '3 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'borrowed',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '3 days',
  NULL,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Request #6: Tung đang mượn Raspberry Pi (2 cái)
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='tung.vu@ptit.edu.vn'),
  'borrowing',
  NOW() + INTERVAL '10 days',
  'Dự án IoT Smart Home',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Raspberry Pi 4 Model B' LIMIT 1), 2, NOW() + INTERVAL '10 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'borrowed',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '10 days',
  NULL,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- ─── 3. OVERDUE requests (quá hạn) ───────────────────────────

-- Request #7: Mai quá hạn trả Laptop Lenovo
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='mai.bui@ptit.edu.vn'),
  'overdue',
  NOW() - INTERVAL '10 days',
  'Viết báo cáo NCKH',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '10 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Laptop Lenovo ThinkPad X1' LIMIT 1), 1, NOW() - INTERVAL '10 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'overdue',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '10 days',
  NULL,
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '10 days'
);

-- Request #8: Duc quá hạn trả Headphone Sony
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='duc.hoang@ptit.edu.vn'),
  'overdue',
  NOW() - INTERVAL '5 days',
  'Ghi âm bài thuyết trình',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '5 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Headphone Sony WH-1000XM5' LIMIT 1), 1, NOW() - INTERVAL '5 days');

INSERT INTO borrow_records (borrow_request_id, status, borrowed_at, expected_return_date, returned_at, created_at, updated_at)
VALUES (
  currval('borrow_requests_id_seq'),
  'overdue',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '5 days',
  NULL,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '5 days'
);

-- ─── 4. PENDING requests (chờ duyệt) ─────────────────────────

-- Request #9: Ngoc đang chờ duyệt mượn Máy chiếu BenQ + Con trỏ laser
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='ngoc.trinh@ptit.edu.vn'),
  'pending',
  NOW() + INTERVAL '7 days',
  'Seminar nhóm nghiên cứu AI',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Máy chiếu BenQ MH560' LIMIT 1), 1, NOW() + INTERVAL '7 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Con trỏ laser Logitech R500' LIMIT 1), 1, NOW() + INTERVAL '7 days');

-- Request #10: Long chờ duyệt mượn bộ thiết bị đo lường
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='long.dinh@ptit.edu.vn'),
  'pending',
  NOW() + INTERVAL '14 days',
  'Thực hành TN điện tử số nhóm 5',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Bộ nguồn DC thí nghiệm' LIMIT 1), 2, NOW() + INTERVAL '14 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Đồng hồ vạn năng Fluke 87V' LIMIT 1), 2, NOW() + INTERVAL '14 days');

-- Request #11: Thu chờ duyệt mượn thiết bị audio
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='thu.phan@ptit.edu.vn'),
  'pending',
  NOW() + INTERVAL '3 days',
  'Quay clip thuyết trình đề tài',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Webcam Logitech C920' LIMIT 1), 1, NOW() + INTERVAL '3 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Micro cài áo Sony ECM-CS3' LIMIT 1), 2, NOW() + INTERVAL '3 days'),
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Loa Bluetooth JBL Flip 5' LIMIT 1), 1, NOW() + INTERVAL '3 days');

-- ─── 5. REJECTED requests ────────────────────────────────────

-- Request #12: Chien bị từ chối (số lượng vượt quá)
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='chien@ptit.edu.vn'),
  'rejected',
  NOW() - INTERVAL '15 days',
  'Cần 10 laptop cho lớp học lập trình',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '19 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='Laptop Dell XPS 13' LIMIT 1), 5, NOW() - INTERVAL '15 days');

-- Request #13: Hoa bị từ chối (thiết bị đang bảo trì)
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='hoa.le@ptit.edu.vn'),
  'rejected',
  NOW() - INTERVAL '5 days',
  'Cần MacBook cho demo sản phẩm',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '7 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='MacBook Pro M2 14"' LIMIT 1), 1, NOW() - INTERVAL '5 days');

-- ─── 6. CANCELLED requests ───────────────────────────────────

-- Request #14: Bao tự huỷ yêu cầu
INSERT INTO borrow_requests (user_id, status, expected_return_date, note, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='bao.pham@ptit.edu.vn'),
  'cancelled',
  NOW() + INTERVAL '2 days',
  'Dùng tạm thiết bị phòng lab',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days'
);

INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
VALUES
  (currval('borrow_requests_id_seq'), (SELECT id FROM equipment WHERE name='USB-C Docking Station' LIMIT 1), 1, NOW() + INTERVAL '2 days');

SELECT setval('borrow_requests_id_seq',    (SELECT COALESCE(MAX(id), 1) FROM borrow_requests));
SELECT setval('borrow_request_items_id_seq',(SELECT COALESCE(MAX(id), 1) FROM borrow_request_items));
SELECT setval('borrow_records_id_seq',     (SELECT COALESCE(MAX(id), 1) FROM borrow_records));
