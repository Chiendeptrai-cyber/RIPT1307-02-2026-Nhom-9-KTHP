import 'dotenv/config';
import { createApp } from './app';
import { startScheduler } from './infrastructure/jobs/scheduler';
import { ensureDefaultAdminUser } from './infrastructure/database/seed-admin';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

// Initialize default admin user before starting server
(async () => {
  try {
    console.log('Seeding default admin user...');
    await ensureDefaultAdminUser();
    console.log('✅ Default admin user initialized');
  } catch (err) {
    console.error('❌ Failed to seed default admin user:', err);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  startScheduler();
});
