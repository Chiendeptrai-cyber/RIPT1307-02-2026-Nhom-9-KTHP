import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getPool } from './connection';

const SEEDS_DIR = path.join(__dirname, 'seeds');

export async function runSeeds(): Promise<void> {
  const pool = getPool();

  console.log('🔄 Ensuring system_settings and email_retry_queue tables exist...');
  await pool.query(`
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
  `);

  // Check if seeds have already been run (idempotency guard)
  const checkResult = await pool.query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'student'`,
  );
  const studentCount = Number(checkResult.rows[0].total);

  if (studentCount >= 10) {
    console.log('ℹ️  Seeds already applied, skipping...');
    return;
  }

  console.log('🌱 Running database seeds...');

  // Read and sort seed files
  const seedFiles = fs
    .readdirSync(SEEDS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of seedFiles) {
    const filePath = path.join(SEEDS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await pool.query('BEGIN');
      await pool.query(sql);
      await pool.query('COMMIT');
      console.log(`  ✅ ${file}`);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(`  ❌ ${file} failed:`, (err as Error).message);
      // Don't throw – continue to next seed file
    }
  }

  console.log('✅ Database seeding complete');
}
