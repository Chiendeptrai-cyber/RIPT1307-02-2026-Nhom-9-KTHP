import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    // DB_SSL=true  → required for cloud-hosted PostgreSQL (Neon, Supabase, Render…)
    // DB_SSL=false → local Docker PostgreSQL (default)
    const useSSL = process.env.DB_SSL === 'true';

    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error', err);
    });
  }
  return pool;
}
