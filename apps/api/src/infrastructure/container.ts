import { getPool } from './database/connection';
import { PgUserRepository }           from './database/repositories/pg-user.repository';
import { PgEquipmentRepository }      from './database/repositories/pg-equipment.repository';
import { PgBorrowRequestRepository }  from './database/repositories/pg-borrow-request.repository';
import { PgNotificationRepository }   from './database/repositories/pg-notification.repository';
// THÊM MỚI: Import Repo ghi nhận mượn trả
import { PgBorrowRecordRepository }   from './database/repositories/pg-borrow-record.repository'; 

import { JwtTokenService }            from './services/jwt-token.service';

import { LoginUseCase }                  from '../application/use-cases/auth/login.use-case';
import { RegisterUseCase }               from '../application/use-cases/auth/register.use-case';
import { ListEquipmentUseCase }          from '../application/use-cases/equipment/list-equipment.use-case';
import { GetEquipmentDetailUseCase }     from '../application/use-cases/equipment/get-equipment-detail.use-case';
import { CreateBorrowRequestUseCase }    from '../application/use-cases/borrow-request/create-borrow-request.use-case';
import { ApproveBorrowRequestUseCase }   from '../application/use-cases/borrow-request/approve-borrow-request.use-case';
import { RejectBorrowRequestUseCase }    from '../application/use-cases/borrow-request/reject-borrow-request.use-case';
import { CancelBorrowRequestUseCase }    from '../application/use-cases/borrow-request/cancel-borrow-request.use-case';
import { ListNotificationsUseCase }      from '../application/use-cases/notification/list-notifications.use-case';
import { MarkNotificationReadUseCase }   from '../application/use-cases/notification/mark-notification-read.use-case';
import { HandoverEquipmentUseCase }      from '../application/use-cases/borrow-request/handover-equipment.use-case';
import { ReturnEquipmentUseCase }        from '../application/use-cases/borrow-request/return-equipment.use-case';

const pool = getPool();

// Repositories
const userRepo           = new PgUserRepository(pool);
const equipmentRepo      = new PgEquipmentRepository(pool);
const borrowRequestRepo  = new PgBorrowRequestRepository(pool);
const notificationRepo   = new PgNotificationRepository(pool);
// THÊM MỚI: Khởi tạo Repo ghi nhận mượn trả
const borrowRecordRepo   = new PgBorrowRecordRepository(pool); 

// Services
const tokenService = new JwtTokenService();

// Auth use cases
export const loginUseCase    = new LoginUseCase(userRepo, tokenService);
export const registerUseCase = new RegisterUseCase(userRepo);

// Equipment use cases
export const listEquipmentUseCase      = new ListEquipmentUseCase(equipmentRepo);
export const getEquipmentDetailUseCase = new GetEquipmentDetailUseCase(equipmentRepo);

// Borrow request use cases
export const createBorrowRequestUseCase  = new CreateBorrowRequestUseCase(borrowRequestRepo, equipmentRepo, notificationRepo);
export const approveBorrowRequestUseCase = new ApproveBorrowRequestUseCase(borrowRequestRepo, notificationRepo);
export const rejectBorrowRequestUseCase  = new RejectBorrowRequestUseCase(borrowRequestRepo, notificationRepo);
export const cancelBorrowRequestUseCase  = new CancelBorrowRequestUseCase(borrowRequestRepo, notificationRepo);

// THÊM MỚI: Khởi tạo 2 Use Case xuất/hoàn kho
export const handoverEquipmentUseCase = new HandoverEquipmentUseCase(borrowRequestRepo, notificationRepo);
export const returnEquipmentUseCase   = new ReturnEquipmentUseCase(borrowRequestRepo, borrowRecordRepo, equipmentRepo, notificationRepo);

// Notification use cases
export const listNotificationsUseCase    = new ListNotificationsUseCase(notificationRepo);
export const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepo);

// Expose repos for controllers that need direct listAll
// THÊM MỚI: Export thêm borrowRecordRepo nếu cần dùng sau này
export { borrowRequestRepo, userRepo, equipmentRepo, borrowRecordRepo };
