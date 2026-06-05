-- ============================================================
-- SEED: violations & notifications
-- ============================================================

-- ─── Violations (vi phạm) ────────────────────────────────────

-- Mai trả trễ Laptop Lenovo -> vi phạm late_return
INSERT INTO violations (user_id, borrow_record_id, type, description, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='mai.bui@ptit.edu.vn'),
  (SELECT br.id FROM borrow_records br
   JOIN borrow_requests breq ON breq.id = br.borrow_request_id
   WHERE breq.user_id = (SELECT id FROM users WHERE email='mai.bui@ptit.edu.vn')
   ORDER BY br.id DESC LIMIT 1),
  'late_return',
  'Quá hạn trả Laptop Lenovo ThinkPad X1 10 ngày. Đề nghị sinh viên liên hệ phòng quản lý để giải quyết.',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
) ON CONFLICT DO NOTHING;

-- Duc quá hạn trả Headphone Sony -> vi phạm late_return
INSERT INTO violations (user_id, borrow_record_id, type, description, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='duc.hoang@ptit.edu.vn'),
  (SELECT br.id FROM borrow_records br
   JOIN borrow_requests breq ON breq.id = br.borrow_request_id
   WHERE breq.user_id = (SELECT id FROM users WHERE email='duc.hoang@ptit.edu.vn')
   ORDER BY br.id DESC LIMIT 1),
  'late_return',
  'Quá hạn trả Headphone Sony WH-1000XM5. Sinh viên đã được nhắc nhở qua email 2 lần.',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
) ON CONFLICT DO NOTHING;

-- ─── Notifications ────────────────────────────────────────────

-- Thông báo approved cho Lan (request #4)
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='lan.nguyen@ptit.edu.vn'),
  'approved',
  'Yêu cầu mượn thiết bị đã được duyệt',
  'Yêu cầu mượn Laptop HP EliteBook 840 của bạn đã được phê duyệt. Vui lòng đến phòng quản lý thiết bị để nhận máy trong giờ hành chính.',
  TRUE,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='nam.dang@ptit.edu.vn'),
  'approved',
  'Yêu cầu mượn thiết bị đã được duyệt',
  'Yêu cầu mượn Oscilloscope và Đồng hồ vạn năng của bạn đã được phê duyệt. Hãy đến nhận thiết bị trước 17:00 hôm nay.',
  TRUE,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='tung.vu@ptit.edu.vn'),
  'approved',
  'Yêu cầu mượn thiết bị đã được duyệt',
  'Yêu cầu mượn 2 Raspberry Pi 4 cho dự án IoT của bạn đã được phê duyệt. Thời hạn trả: 10 ngày kể từ hôm nay.',
  FALSE,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Thông báo rejected cho Chien và Hoa
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='chien@ptit.edu.vn'),
  'rejected',
  'Yêu cầu mượn thiết bị bị từ chối',
  'Yêu cầu mượn 5 Laptop Dell XPS 13 không được chấp thuận do số lượng yêu cầu vượt quá số lượng khả dụng. Vui lòng liên hệ để biết thêm thông tin.',
  TRUE,
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '19 days'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='hoa.le@ptit.edu.vn'),
  'rejected',
  'Yêu cầu mượn thiết bị bị từ chối',
  'Yêu cầu mượn MacBook Pro M2 không được chấp thuận do thiết bị hiện đang trong quá trình bảo trì. Dự kiến thiết bị sẽ sẵn sàng trong 2 tuần tới.',
  TRUE,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
);

-- Thông báo overdue cho Mai và Duc
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='mai.bui@ptit.edu.vn'),
  'overdue_alert',
  '⚠️ Cảnh báo: Thiết bị quá hạn trả',
  'Laptop Lenovo ThinkPad X1 đã quá hạn trả 10 ngày. Tài khoản của bạn hiện bị hạn chế mượn thiết bị. Vui lòng trả ngay để tránh bị xử lý kỷ luật.',
  FALSE,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='duc.hoang@ptit.edu.vn'),
  'overdue_alert',
  '⚠️ Cảnh báo: Thiết bị quá hạn trả',
  'Headphone Sony WH-1000XM5 đã quá hạn trả 5 ngày. Đây là lần nhắc thứ 2. Tài khoản của bạn sẽ bị khoá nếu không trả trong 48 giờ.',
  FALSE,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Thông báo due_reminder cho Lan và Nam (sắp đến hạn)
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='lan.nguyen@ptit.edu.vn'),
  'due_reminder',
  '🔔 Nhắc nhở: Sắp đến hạn trả thiết bị',
  'Laptop HP EliteBook 840 sẽ đến hạn trả sau 5 ngày (10/06/2026). Vui lòng chuẩn bị trả thiết bị đúng hạn.',
  FALSE,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='nam.dang@ptit.edu.vn'),
  'due_reminder',
  '🔔 Nhắc nhở: Sắp đến hạn trả thiết bị',
  'Oscilloscope Rigol DS1054Z và Đồng hồ vạn năng Fluke 87V sẽ đến hạn trả sau 3 ngày (08/06/2026).',
  FALSE,
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
);

-- Thông báo new_request cho admin
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='admin@ptit.edu.vn'),
  'new_request',
  '📋 Yêu cầu mượn mới cần duyệt',
  'Sinh viên Trịnh Thị Ngọc vừa gửi yêu cầu mượn Máy chiếu BenQ MH560 và Con trỏ laser. Vui lòng xem xét và phê duyệt.',
  FALSE,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='admin@ptit.edu.vn'),
  'new_request',
  '📋 Yêu cầu mượn mới cần duyệt',
  'Sinh viên Đinh Văn Long vừa gửi yêu cầu mượn 2 Bộ nguồn DC và 2 Đồng hồ vạn năng cho thực hành nhóm.',
  FALSE,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
);

INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email='admin@ptit.edu.vn'),
  'new_request',
  '📋 Yêu cầu mượn mới cần duyệt',
  'Sinh viên Phan Thị Thu vừa gửi yêu cầu mượn Webcam, 2 Micro cài áo và Loa Bluetooth để quay clip thuyết trình.',
  FALSE,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
);

SELECT setval('violations_id_seq',    (SELECT COALESCE(MAX(id), 1) FROM violations));
SELECT setval('notifications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM notifications));
