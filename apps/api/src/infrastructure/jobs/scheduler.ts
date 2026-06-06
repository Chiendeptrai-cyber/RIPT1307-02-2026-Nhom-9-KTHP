import cron from 'node-cron';
import { dueReminderJob } from './due-reminder.job';
import { overdueCheckJob } from './overdue-check.job';
import { autoCancelJob } from './auto-cancel.job';

export function startScheduler(): void {
  cron.schedule('0 8 * * *', dueReminderJob, { timezone: 'Asia/Ho_Chi_Minh' });
  cron.schedule('0 0 * * *', overdueCheckJob, { timezone: 'Asia/Ho_Chi_Minh' });  // Midnight check overdue
  cron.schedule('0 * * * *', autoCancelJob, { timezone: 'Asia/Ho_Chi_Minh' });    // Hourly auto-cancel check
  console.log('⏰ Scheduler started (due-reminder, overdue-check, auto-cancel)');
}
