CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (key, value) VALUES
('notification', '{"reminderHour": "08:00", "overdueHour": "00:00", "scanDays": 3, "sendToAdmin": true, "maxRetry": 3, "retryInterval": 5, "alertCron": true}')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS email_retry_queue (
  id SERIAL PRIMARY KEY,
  event VARCHAR(50) NOT NULL,
  recipient_name VARCHAR(100),
  recipient_email VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  try_num INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  last_error TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_retry_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
