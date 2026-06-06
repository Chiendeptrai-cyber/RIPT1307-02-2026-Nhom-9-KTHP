import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getPool } from './connection';

async function main() {
  const pool = getPool();
  try {
    const sqlPath = path.join(__dirname, '../../../../../setup_queues.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Migration applied successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

main();
