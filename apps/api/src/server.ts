import 'dotenv/config';
import { createApp } from './app';
import { startScheduler } from './infrastructure/jobs/scheduler';
import { getPool } from './infrastructure/database/connection';
import { runMigrations } from './infrastructure/database/migration-runner';
import { ensureDefaultAdminUser } from './infrastructure/database/seed-admin';
import { runSeeds, runMigrations } from './infrastructure/database/seed-runner';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

// Run migrations → seed admin → seed sample data → start server
(async () => {
  try {
    console.log('Running database migrations...');
    await runMigrations();

    console.log('Seeding default admin user...');
    await ensureDefaultAdminUser();
    console.log('✅ Default admin user initialized');

    console.log('Running sample data seeds...');
    await runSeeds();
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  startScheduler();
});
