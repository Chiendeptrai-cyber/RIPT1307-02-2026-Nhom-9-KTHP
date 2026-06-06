import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getPool } from './connection';

const SEEDS_DIR = path.join(__dirname, 'seeds');

export async function runSeeds(): Promise<void> {
  const pool = getPool();

  // Check if seeds have already been run (idempotency guard)
  const checkStudents = await pool.query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'student'`,
  );
  const checkEquipment = await pool.query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM equipment`,
  );
  const studentCount = Number(checkStudents.rows[0].total);
  const equipmentCount = Number(checkEquipment.rows[0].total);

  if (studentCount >= 10 && equipmentCount >= 20) {
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
