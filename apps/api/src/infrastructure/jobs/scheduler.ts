import cron from 'node-cron';
import { dueReminderJob } from './due-reminder.job';
import { overdueCheckJob } from './overdue-check.job';

export function startScheduler(): void {
  cron.schedule('0 8 * * *', dueReminderJob, { timezone: 'Asia/Ho_Chi_Minh' });
  cron.schedule('0 9 * * *', overdueCheckJob, { timezone: 'Asia/Ho_Chi_Minh' });
  console.log('⏰ Scheduler started');
}
