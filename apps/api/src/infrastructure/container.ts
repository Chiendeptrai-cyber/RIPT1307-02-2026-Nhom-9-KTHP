import { getPool } from './database/connection';
import { PgUserRepository } from './database/repositories/pg-user.repository';
import { PgEquipmentRepository } from './database/repositories/pg-equipment.repository';
import { PgBorrowRequestRepository } from './database/repositories/pg-borrow-request.repository';
import { PgNotificationRepository } from './database/repositories/pg-notification.repository';
import { PgBorrowRecordRepository } from './database/repositories/pg-borrow-record.repository';
import { PgViolationRepository } from './database/repositories/pg-violation.repository';
import { PgStockLogRepository } from './database/repositories/pg-stock-log.repository';
import { PgEmailLogRepository } from './database/repositories/pg-email-log.repository';
import { JwtTokenService } from './services/jwt-token.service';
import { NodemailerEmailService } from './services/nodemailer-email.service';

import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../application/use-cases/auth/register.use-case';
import { CreateBorrowRequestUseCase } from '../application/use-cases/borrow-request/create-borrow-request.use-case';

const pool = getPool();

const userRepo = new PgUserRepository(pool);
const equipmentRepo = new PgEquipmentRepository(pool);
const borrowRequestRepo = new PgBorrowRequestRepository(pool);
const notificationRepo = new PgNotificationRepository(pool);
const borrowRecordRepo = new PgBorrowRecordRepository(pool);
const violationRepo = new PgViolationRepository(pool);
const stockLogRepo = new PgStockLogRepository(pool);
const emailLogRepo = new PgEmailLogRepository(pool);

const tokenService = new JwtTokenService();
const emailService = new NodemailerEmailService();

export const loginUseCase = new LoginUseCase(userRepo, tokenService);
export const registerUseCase = new RegisterUseCase(userRepo);
export const createBorrowRequestUseCase = new CreateBorrowRequestUseCase(
  borrowRequestRepo,
  equipmentRepo,
  notificationRepo,
);
