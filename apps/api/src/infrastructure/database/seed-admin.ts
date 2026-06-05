import { UserRole, UserStatus } from '@equipment-mgmt/shared';
import { userRepo } from '../container';

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@ptit.edu.vn';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME ?? 'Admin PTIT';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? 'password';

export async function ensureDefaultAdminUser(): Promise<void> {
  const existingUser = await userRepo.findByEmail(DEFAULT_ADMIN_EMAIL);
  if (existingUser) {
    return;
  }

  await userRepo.create({
    fullName: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash: DEFAULT_ADMIN_PASSWORD,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });

  console.log(`Seeded default admin user: ${DEFAULT_ADMIN_EMAIL}`);
}
