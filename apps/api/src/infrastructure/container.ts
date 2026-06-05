import { getPool } from './database/connection';
import { PgUserRepository }           from './database/repositories/pg-user.repository';
import { PgEquipmentRepository }      from './database/repositories/pg-equipment.repository';
import { PgBorrowRequestRepository }  from './database/repositories/pg-borrow-request.repository';
import { PgBorrowRecordRepository }   from './database/repositories/pg-borrow-record.repository';
import { PgNotificationRepository }   from './database/repositories/pg-notification.repository';
import { PgPasswordResetTokenRepository } from './database/repositories/pg-password-reset-token.repository';
import { PgViolationRepository }      from './database/repositories/pg-violation.repository';
import { JwtTokenService }            from './services/jwt-token.service';

import { LoginUseCase }                  from '../application/use-cases/auth/login.use-case';
import { RegisterUseCase }               from '../application/use-cases/auth/register.use-case';
import { ForgotPasswordUseCase }         from '../application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase }          from '../application/use-cases/auth/reset-password.use-case';
import { ListEquipmentUseCase }          from '../application/use-cases/equipment/list-equipment.use-case';
import { GetEquipmentDetailUseCase }     from '../application/use-cases/equipment/get-equipment-detail.use-case';
import { CreateEquipmentUseCase }         from '../application/use-cases/equipment/create-equipment.use-case';
import { UpdateEquipmentUseCase }         from '../application/use-cases/equipment/update-equipment.use-case';
import { DeleteEquipmentUseCase }         from '../application/use-cases/equipment/delete-equipment.use-case';
import { CreateBorrowRequestUseCase }    from '../application/use-cases/borrow-request/create-borrow-request.use-case';
import { ApproveBorrowRequestUseCase }   from '../application/use-cases/borrow-request/approve-borrow-request.use-case';
import { RejectBorrowRequestUseCase }    from '../application/use-cases/borrow-request/reject-borrow-request.use-case';
import { CancelBorrowRequestUseCase }    from '../application/use-cases/borrow-request/cancel-borrow-request.use-case';
import { ListNotificationsUseCase }      from '../application/use-cases/notification/list-notifications.use-case';
import { MarkNotificationReadUseCase }   from '../application/use-cases/notification/mark-notification-read.use-case';
import { ListUsersUseCase }              from '../application/use-cases/user/list-users.use-case';
import { LockUserUseCase }               from '../application/use-cases/user/lock-user.use-case';
import { GetUserProfileUseCase }         from '../application/use-cases/user/get-user-profile.use-case';
import { ChangePasswordUseCase }         from '../application/use-cases/user/change-password.use-case';
import { UpdateProfileUseCase }          from '../application/use-cases/user/update-profile.use-case';
import { GetDashboardStatsUseCase }      from '../application/use-cases/report/get-dashboard-stats.use-case';
import { ExportReportUseCase }           from '../application/use-cases/report/export-report.use-case';

import { NodemailerEmailService } from './services/nodemailer-email.service';

const pool = getPool();

// Repositories
const userRepo           = new PgUserRepository(pool);
const equipmentRepo      = new PgEquipmentRepository(pool);
const borrowRequestRepo  = new PgBorrowRequestRepository(pool);
const borrowRecordRepo   = new PgBorrowRecordRepository(pool);
const notificationRepo   = new PgNotificationRepository(pool);
const passwordResetTokenRepo = new PgPasswordResetTokenRepository(pool);
const violationRepo      = new PgViolationRepository(pool);

// Services
const tokenService = new JwtTokenService();
const emailService = new NodemailerEmailService();

// Auth use cases
export const loginUseCase    = new LoginUseCase(userRepo, tokenService);
export const registerUseCase = new RegisterUseCase(userRepo);
export const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepo, passwordResetTokenRepo, emailService);
export const resetPasswordUseCase  = new ResetPasswordUseCase(userRepo, passwordResetTokenRepo);

// Equipment use cases
export const listEquipmentUseCase      = new ListEquipmentUseCase(equipmentRepo);
export const getEquipmentDetailUseCase = new GetEquipmentDetailUseCase(equipmentRepo);
export const createEquipmentUseCase    = new CreateEquipmentUseCase(equipmentRepo);
export const updateEquipmentUseCase    = new UpdateEquipmentUseCase(equipmentRepo);
export const deleteEquipmentUseCase    = new DeleteEquipmentUseCase(equipmentRepo);

// Borrow request use cases
export const createBorrowRequestUseCase  = new CreateBorrowRequestUseCase(borrowRequestRepo, equipmentRepo, notificationRepo, userRepo);
export const approveBorrowRequestUseCase = new ApproveBorrowRequestUseCase(borrowRequestRepo, notificationRepo, userRepo, emailService);
export const rejectBorrowRequestUseCase  = new RejectBorrowRequestUseCase(borrowRequestRepo, notificationRepo, userRepo, emailService);
export const cancelBorrowRequestUseCase  = new CancelBorrowRequestUseCase(borrowRequestRepo, notificationRepo);

// Notification use cases
export const listNotificationsUseCase    = new ListNotificationsUseCase(notificationRepo);
export const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepo);

// User use cases
export const listUsersUseCase       = new ListUsersUseCase(userRepo);
export const lockUserUseCase        = new LockUserUseCase(userRepo);
export const getUserProfileUseCase  = new GetUserProfileUseCase(userRepo);
export const changePasswordUseCase  = new ChangePasswordUseCase(userRepo);
export const updateProfileUseCase   = new UpdateProfileUseCase(userRepo);

// Report use cases
export const getDashboardStatsUseCase = new GetDashboardStatsUseCase(
  borrowRequestRepo,
  borrowRecordRepo,
  userRepo,
  equipmentRepo,
  violationRepo,
);
export const exportReportUseCase = new ExportReportUseCase(borrowRecordRepo);

// Expose repos for controllers that need direct listAll
export { borrowRequestRepo, userRepo, equipmentRepo };
