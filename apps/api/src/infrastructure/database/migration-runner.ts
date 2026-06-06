import fs from 'fs';
import path from 'path';
import type { Pool } from 'pg';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Ensures the `schema_migrations` tracking table exists.
 */
async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          SERIAL PRIMARY KEY,
      filename    TEXT NOT NULL UNIQUE,
      applied_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

/**
 * Returns the set of migration filenames that have already been applied.
 */
async function getAppliedMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations ORDER BY filename',
  );
  return new Set(result.rows.map((r) => r.filename));
}

/**
 * Reads, sorts, and applies any pending SQL migration files.
 * Each migration runs inside its own transaction for atomicity.
 */
export async function runMigrations(pool: Pool): Promise<void> {
  await ensureMigrationsTable(pool);

  const applied = await getAppliedMigrations(pool);

  const allFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const pending = allFiles.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log('ℹ️  All migrations already applied, nothing to do.');
    return;
  }

  console.log(`📦 Running ${pending.length} pending migration(s)...`);

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await pool.query('BEGIN');
      await pool.query(sql);
      await pool.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file],
      );
      await pool.query('COMMIT');
      console.log(`  ✅ ${file}`);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(`  ❌ Migration ${file} failed:`, (err as Error).message);
      throw err; // stop on first failure – don't leave DB in half-migrated state
    }
  }

  console.log('✅ All migrations applied successfully.');
}
