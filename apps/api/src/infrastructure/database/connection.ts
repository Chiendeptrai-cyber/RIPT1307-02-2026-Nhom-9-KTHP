import { Pool } from 'pg';

let pool: Pool;

function ensureString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'string' ? value : String(value);
}

export function getPool(): Pool {
  if (!pool) {
    // Priority 1: DATABASE_URL (single connection string — provided by Neon, Render, Railway, etc.)
    // Priority 2: individual DB_* variables (used in Docker Compose local setup)
    const connectionString = ensureString(process.env.DATABASE_URL);

    // DB_SSL=true  → force SSL (for cloud DB without sslmode in connection string)
    // DB_SSL=false → no SSL (local Docker)
    // If DATABASE_URL already contains ?sslmode=require, pg handles it automatically.
    const useSSL = process.env.DB_SSL === 'true';

    if (connectionString) {
      pool = new Pool({
        connectionString,
        // sslmode=require in the URL is enough; rejectUnauthorized:false avoids cert issues
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      const host = ensureString(process.env.DB_HOST);
      const port = Number(process.env.DB_PORT ?? 5432);
      const database = ensureString(process.env.DB_NAME);
      const user = ensureString(process.env.DB_USER);
      const password = ensureString(process.env.DB_PASSWORD);

      if (!user || !database || !host) {
        console.warn('DB_HOST/DB_NAME/DB_USER missing — connection may fail.');
      }

      pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error', err);
    });
  }
  return pool;
}

