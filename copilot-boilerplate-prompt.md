# COPILOT PROMPT — Equipment Borrowing & Return Management System
# Boilerplate Generation Guide

---

## 🎯 PROJECT CONTEXT

You are generating a production-grade monorepo boilerplate for an
**Equipment Borrowing & Return Management System** (Hệ thống Quản lý Mượn Trả Thiết Bị).

Two actors: **Student** (borrower) and **Admin** (manager).
Core flows: authentication, equipment browsing, borrow request lifecycle
(pending → approved → borrowing → returned), violation tracking,
stock management, notifications, scheduled cron jobs.

---

## 🛠 TECH STACK — EXACT VERSIONS

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Runtime    | Node.js 24 (LTS)                                |
| Language   | TypeScript 5.x — **all files**, no `.js` allowed |
| Frontend   | UmiJS 4.x + React 18 + Ant Design 5.x          |
| Backend    | Express.js 4.x                                  |
| Database   | PostgreSQL 16 + `pg` driver + `db-migrate`      |
| Monorepo   | pnpm workspaces                                 |
| Validation | Zod (shared between FE & BE)                    |
| Auth       | JWT (access token 8h) + bcryptjs                |
| Email      | Nodemailer (SMTP)                               |
| Scheduler  | node-cron                                       |
| HTTP Client| Axios (frontend)                                |
| Linting    | ESLint + Prettier (shared config)               |

---

## 📁 MONOREPO STRUCTURE — GENERATE EXACTLY THIS

```
equipment-management/
├── apps/
│   ├── api/                         # Express backend
│   └── web/                         # UmiJS frontend
├── packages/
│   └── shared/                      # Shared types, DTOs, enums, Zod schemas
├── .eslintrc.base.js
├── .prettierrc
├── tsconfig.base.json
├── pnpm-workspace.yaml
└── package.json                     # Root — scripts only, no dependencies
```

---

## 📦 PACKAGE: `packages/shared`

Shared code imported by BOTH `apps/api` and `apps/web`.
**Zero runtime dependencies** — types, enums, Zod schemas, constants only.

### File structure:
```
packages/shared/
├── src/
│   ├── enums/
│   │   ├── user.enum.ts
│   │   ├── equipment.enum.ts
│   │   ├── borrow-request.enum.ts
│   │   ├── notification.enum.ts
│   │   └── index.ts
│   ├── schemas/                     # Zod schemas — source of truth for validation
│   │   ├── auth.schema.ts
│   │   ├── equipment.schema.ts
│   │   ├── borrow-request.schema.ts
│   │   └── index.ts
│   ├── types/                       # TypeScript interfaces inferred from Zod or standalone
│   │   ├── api-response.type.ts
│   │   ├── pagination.type.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── business.constant.ts     # MAX_BORROW_DAYS, MAX_EMAIL_RETRY, etc.
│   │   └── index.ts
│   └── index.ts                     # Barrel export
├── package.json
└── tsconfig.json
```

### Generate these files:

**`src/enums/user.enum.ts`**
```typescript
export enum UserRole {
  STUDENT = 'student',
  ADMIN   = 'admin',
}

export enum UserStatus {
  ACTIVE          = 'active',
  BORROW_BLOCKED  = 'borrow_blocked',
  LOCKED          = 'locked',
}
```

**`src/enums/equipment.enum.ts`**
```typescript
export enum EquipmentStatus {
  ACTIVE            = 'active',
  UNDER_MAINTENANCE = 'under_maintenance',
  DELETED           = 'deleted',
}

export enum InstanceCondition {
  GOOD         = 'good',
  RESERVED     = 'reserved',
  BORROWED     = 'borrowed',
  DAMAGED      = 'damaged',
  LOST         = 'lost',
  UNDER_REPAIR = 'under_repair',
}
```

**`src/enums/borrow-request.enum.ts`**
```typescript
export enum BorrowRequestStatus {
  PENDING      = 'pending',
  APPROVED     = 'approved',
  REJECTED     = 'rejected',
  CANCELLED    = 'cancelled',
  BORROWING    = 'borrowing',
  OVERDUE      = 'overdue',
  UNDER_REVIEW = 'under_review',
  RETURNED     = 'returned',
}

export enum BorrowRecordStatus {
  BORROWED         = 'borrowed',
  PARTIAL_RETURNED = 'partial_returned',
  RETURNED         = 'returned',
  OVERDUE          = 'overdue',
}

export enum ViolationType {
  LATE_RETURN = 'late_return',
  DAMAGED     = 'damaged',
  LOST        = 'lost',
}

export enum StockActionType {
  IMPORT         = 'import',
  MARK_DAMAGED   = 'mark_damaged',
  MARK_LOST      = 'mark_lost',
  REPAIRED       = 'repaired',
  ADJUSTMENT     = 'adjustment',
  BORROW_APPROVE = 'borrow_approve',
  BORROW_RETURN  = 'borrow_return',
  BORROW_CANCEL  = 'borrow_cancel',
}
```

**`src/enums/notification.enum.ts`**
```typescript
export enum NotificationType {
  NEW_REQUEST        = 'new_request',
  APPROVED           = 'approved',
  REJECTED           = 'rejected',
  CHECKOUT_CONFIRMED = 'checkout_confirmed',
  RETURN_CONFIRMED   = 'return_confirmed',
  DUE_REMINDER       = 'due_reminder',
  OVERDUE_ALERT      = 'overdue_alert',
}

export enum EmailLogType {
  APPROVED           = 'approved',
  REJECTED           = 'rejected',
  CHECKOUT_CONFIRMED = 'checkout_confirmed',
  DUE_REMINDER       = 'due_reminder',
  OVERDUE_ALERT      = 'overdue_alert',
}

export enum EmailSendStatus {
  PENDING = 'pending',
  SENT    = 'sent',
  FAILED  = 'failed',
}
```

**`src/constants/business.constant.ts`**
```typescript
export const BUSINESS = {
  SESSION_DURATION_HOURS:      8,
  PASSWORD_RESET_EXPIRES_MIN:  30,
  MAX_EMAIL_RETRY:             3,
  EMAIL_RETRY_INTERVAL_MIN:    5,
  RETURN_UNDO_WINDOW_MIN:      5,
  MAX_BORROW_EXTENSION:        1,       // chỉ gia hạn 1 lần
  DUE_REMINDER_DAYS_BEFORE:    [1, 2, 3],
  NOTIFICATION_DISPLAY_LIMIT:  50,
  NOTIFICATION_ARCHIVE_DAYS:   30,
  EQUIPMENT_IMAGE_MAX_MB:      5,
  ALLOWED_IMAGE_TYPES:         ['image/jpeg', 'image/png'],
  EQUIPMENT_PAGE_SIZE:         20,
  MAX_REPORT_RANGE_DAYS:       365,
} as const;
```

**`src/types/api-response.type.ts`**
```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data:    T | null;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items:      T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}
```

---

## 🖥 APP: `apps/api` — Express Backend (Clean Architecture)

### Folder structure:
```
apps/api/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── equipment.entity.ts
│   │   │   ├── equipment-instance.entity.ts
│   │   │   ├── borrow-request.entity.ts
│   │   │   ├── borrow-request-item.entity.ts
│   │   │   ├── borrow-record.entity.ts
│   │   │   ├── borrow-record-instance.entity.ts
│   │   │   ├── violation.entity.ts
│   │   │   ├── equipment-stock-log.entity.ts
│   │   │   ├── notification.entity.ts
│   │   │   ├── email-log.entity.ts
│   │   │   └── password-reset-token.entity.ts
│   │   ├── repositories/              # Interfaces only — no implementation
│   │   │   ├── user.repository.ts
│   │   │   ├── equipment.repository.ts
│   │   │   ├── borrow-request.repository.ts
│   │   │   ├── borrow-record.repository.ts
│   │   │   ├── notification.repository.ts
│   │   │   ├── violation.repository.ts
│   │   │   ├── stock-log.repository.ts
│   │   │   └── email-log.repository.ts
│   │   └── errors/
│   │       ├── app.error.ts           # Base AppError class
│   │       ├── not-found.error.ts
│   │       ├── forbidden.error.ts
│   │       ├── conflict.error.ts
│   │       └── validation.error.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── login.use-case.ts
│   │   │   │   ├── register.use-case.ts
│   │   │   │   ├── forgot-password.use-case.ts
│   │   │   │   └── reset-password.use-case.ts
│   │   │   ├── equipment/
│   │   │   │   ├── list-equipment.use-case.ts
│   │   │   │   ├── get-equipment-detail.use-case.ts
│   │   │   │   ├── create-equipment.use-case.ts
│   │   │   │   ├── update-equipment.use-case.ts
│   │   │   │   ├── delete-equipment.use-case.ts
│   │   │   │   └── update-stock.use-case.ts
│   │   │   ├── borrow-request/
│   │   │   │   ├── create-borrow-request.use-case.ts
│   │   │   │   ├── cancel-borrow-request.use-case.ts
│   │   │   │   ├── approve-borrow-request.use-case.ts
│   │   │   │   ├── reject-borrow-request.use-case.ts
│   │   │   │   ├── checkout-borrow-request.use-case.ts
│   │   │   │   ├── return-equipment.use-case.ts
│   │   │   │   ├── extend-borrow-request.use-case.ts
│   │   │   │   └── undo-return.use-case.ts
│   │   │   ├── notification/
│   │   │   │   ├── list-notifications.use-case.ts
│   │   │   │   └── mark-notification-read.use-case.ts
│   │   │   ├── report/
│   │   │   │   ├── get-dashboard-stats.use-case.ts
│   │   │   │   └── export-report.use-case.ts
│   │   │   └── user/
│   │   │       ├── list-users.use-case.ts
│   │   │       ├── lock-user.use-case.ts
│   │   │       └── get-user-profile.use-case.ts
│   │   └── interfaces/                # Ports for external services
│   │       ├── email-service.interface.ts
│   │       ├── storage-service.interface.ts
│   │       └── token-service.interface.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── connection.ts          # pg Pool singleton
│   │   │   ├── migrations/            # SQL migration files
│   │   │   │   └── 001_initial_schema.sql
│   │   │   └── repositories/          # Concrete implementations
│   │   │       ├── pg-user.repository.ts
│   │   │       ├── pg-equipment.repository.ts
│   │   │       ├── pg-borrow-request.repository.ts
│   │   │       ├── pg-borrow-record.repository.ts
│   │   │       ├── pg-notification.repository.ts
│   │   │       ├── pg-violation.repository.ts
│   │   │       ├── pg-stock-log.repository.ts
│   │   │       └── pg-email-log.repository.ts
│   │   ├── services/
│   │   │   ├── nodemailer-email.service.ts
│   │   │   ├── local-storage.service.ts
│   │   │   └── jwt-token.service.ts
│   │   ├── jobs/
│   │   │   ├── scheduler.ts           # Register all cron jobs here
│   │   │   ├── due-reminder.job.ts    # 08:00 daily — sắp đến hạn
│   │   │   └── overdue-check.job.ts   # 09:00 daily — cập nhật quá hạn
│   │   └── container.ts              # Dependency injection container
│   │
│   ├── presentation/
│   │   ├── routes/
│   │   │   ├── index.ts              # Mount all routers
│   │   │   ├── auth.route.ts
│   │   │   ├── equipment.route.ts
│   │   │   ├── borrow-request.route.ts
│   │   │   ├── notification.route.ts
│   │   │   ├── report.route.ts
│   │   │   └── user.route.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── equipment.controller.ts
│   │   │   ├── borrow-request.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   └── user.controller.ts
│   │   └── middlewares/
│   │       ├── authenticate.middleware.ts   # Verify JWT
│   │       ├── authorize.middleware.ts      # Role guard (admin/student)
│   │       ├── validate.middleware.ts       # Zod request validation
│   │       └── error-handler.middleware.ts  # Global error handler
│   │
│   ├── app.ts                        # Express app setup (no listen)
│   └── server.ts                     # Entry point — listen + cron start
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

### Generate these backend files:

**`src/domain/errors/app.error.ts`**
```typescript
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**`src/domain/errors/not-found.error.ts`**
```typescript
import { AppError } from './app.error';
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

**`src/domain/errors/forbidden.error.ts`**
```typescript
import { AppError } from './app.error';
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}
```

**`src/domain/errors/conflict.error.ts`**
```typescript
import { AppError } from './app.error';
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
```

**`src/domain/repositories/user.repository.ts`**
```typescript
import type { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>;
  findAll(options: { page: number; pageSize: number; role?: string }): Promise<{ items: UserEntity[]; total: number }>;
}
```

**`src/infrastructure/database/connection.ts`**
```typescript
import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max:      20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error', err);
    });
  }
  return pool;
}
```

**`src/infrastructure/container.ts`**
```typescript
// Manual DI container — wire use cases with concrete implementations
// Pattern: instantiate repos → instantiate services → instantiate use cases
// Import and export everything from this file; controllers import from here

import { getPool } from './database/connection';
import { PgUserRepository }          from './database/repositories/pg-user.repository';
import { PgEquipmentRepository }     from './database/repositories/pg-equipment.repository';
import { PgBorrowRequestRepository } from './database/repositories/pg-borrow-request.repository';
import { PgNotificationRepository }  from './database/repositories/pg-notification.repository';
import { JwtTokenService }           from './services/jwt-token.service';
import { NodemailerEmailService }    from './services/nodemailer-email.service';

import { LoginUseCase }              from '../application/use-cases/auth/login.use-case';
import { RegisterUseCase }           from '../application/use-cases/auth/register.use-case';
import { CreateBorrowRequestUseCase }from '../application/use-cases/borrow-request/create-borrow-request.use-case';
// ... import all other use cases

const pool = getPool();

// --- Repositories ---
const userRepo          = new PgUserRepository(pool);
const equipmentRepo     = new PgEquipmentRepository(pool);
const borrowRequestRepo = new PgBorrowRequestRepository(pool);
const notificationRepo  = new PgNotificationRepository(pool);

// --- Services ---
const tokenService = new JwtTokenService();
const emailService = new NodemailerEmailService();

// --- Use Cases ---
export const loginUseCase              = new LoginUseCase(userRepo, tokenService);
export const registerUseCase           = new RegisterUseCase(userRepo);
export const createBorrowRequestUseCase= new CreateBorrowRequestUseCase(borrowRequestRepo, equipmentRepo, notificationRepo);
// ... export all other use cases
```

**`src/presentation/middlewares/error-handler.middleware.ts`**
```typescript
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/app.error';
import type { ApiResponse } from '@equipment-mgmt/shared';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data:    null,
      message: err.message,
      code:    err.code,
    } satisfies ApiResponse);
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    data:    null,
    message: 'Internal server error',
  } satisfies ApiResponse);
}
```

**`src/presentation/middlewares/authenticate.middleware.ts`**
```typescript
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ForbiddenError } from '../../domain/errors/forbidden.error';

export interface AuthPayload {
  userId: number;
  role:   string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ForbiddenError('No token provided');

  try {
    const token   = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user      = payload;
    next();
  } catch {
    throw new ForbiddenError('Invalid or expired token');
  }
}
```

**`src/presentation/middlewares/authorize.middleware.ts`**
```typescript
import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../../domain/errors/forbidden.error';
import { UserRole } from '@equipment-mgmt/shared';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
```

**`src/presentation/middlewares/validate.middleware.ts`**
```typescript
import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(422).json({
        success: false,
        data:    null,
        message: 'Validation failed',
        errors:  formatZodErrors(result.error),
      });
      return;
    }
    req[target] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.path.join('.');
    acc[key]  = [...(acc[key] ?? []), issue.message];
    return acc;
  }, {});
}
```

**`src/presentation/middlewares/validate.middleware.ts` — ALSO validate response helper**

**`src/app.ts`**
```typescript
import 'express-async-errors';
import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import { router } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/error-handler.middleware';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
}
```

**`src/server.ts`**
```typescript
import 'dotenv/config';
import { createApp }      from './app';
import { startScheduler } from './infrastructure/jobs/scheduler';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  startScheduler();
});
```

**`src/infrastructure/jobs/scheduler.ts`**
```typescript
import cron from 'node-cron';
import { dueReminderJob }  from './due-reminder.job';
import { overdueCheckJob } from './overdue-check.job';

export function startScheduler(): void {
  // 08:00 daily — gửi email nhắc sắp đến hạn
  cron.schedule('0 8 * * *', dueReminderJob,  { timezone: 'Asia/Ho_Chi_Minh' });

  // 09:00 daily — cập nhật trạng thái quá hạn + gửi cảnh báo
  cron.schedule('0 9 * * *', overdueCheckJob, { timezone: 'Asia/Ho_Chi_Minh' });

  console.log('⏰ Scheduler started');
}
```

**`.env.example`**
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=equipment_mgmt
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=change_this_to_a_random_256bit_secret
JWT_EXPIRES_IN=8h

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
SMTP_FROM="Equipment System <no-reply@equipment.com>"

CORS_ORIGIN=http://localhost:8000
UPLOAD_DIR=./uploads
```

**`package.json` (apps/api)**
```json
{
  "name": "@equipment-mgmt/api",
  "scripts": {
    "dev":   "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "lint":  "eslint src --ext .ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "express-async-errors": "^3.1.1",
    "pg": "^8.12.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.14",
    "node-cron": "^3.0.3",
    "zod": "^3.23.8",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5",
    "@equipment-mgmt/shared": "workspace:*"
  },
  "devDependencies": {
    "tsx": "^4.15.7",
    "typescript": "^5.5.3",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.11.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bcryptjs": "^2.4.6",
    "@types/nodemailer": "^6.4.15",
    "@types/node-cron": "^3.0.11",
    "@types/cors": "^2.8.17"
  }
}
```

---

## 🌐 APP: `apps/web` — UmiJS Frontend

### Folder structure:
```
apps/web/
├── src/
│   ├── pages/
│   │   ├── index.tsx                 # Redirect based on role
│   │   ├── login/
│   │   │   └── index.tsx
│   │   ├── register/
│   │   │   └── index.tsx
│   │   ├── forgot-password/
│   │   │   └── index.tsx
│   │   │
│   │   ├── equipment/               # Student: browse equipment
│   │   │   ├── index.tsx            # List
│   │   │   └── [id].tsx             # Detail
│   │   │
│   │   ├── borrow-request/          # Student: create & view requests
│   │   │   ├── create.tsx
│   │   │   └── index.tsx            # History list
│   │   │
│   │   ├── notifications/
│   │   │   └── index.tsx
│   │   │
│   │   └── admin/                   # Admin-only pages
│   │       ├── dashboard/
│   │       │   └── index.tsx
│   │       ├── requests/
│   │       │   ├── index.tsx        # All requests list
│   │       │   └── [id].tsx         # Request detail + actions
│   │       ├── equipment/
│   │       │   ├── index.tsx        # Equipment management
│   │       │   └── [id]/
│   │       │       └── stock.tsx    # Stock management
│   │       ├── users/
│   │       │   └── index.tsx
│   │       └── reports/
│   │           └── index.tsx
│   │
│   ├── layouts/
│   │   ├── StudentLayout.tsx        # Sidebar + header for students
│   │   ├── AdminLayout.tsx          # Sidebar + header for admins
│   │   └── AuthLayout.tsx           # Centered card layout for login/register
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── PageHeader.tsx
│   │   │   ├── StatusBadge.tsx      # Colored badge for request/equipment status
│   │   │   ├── ConfirmModal.tsx     # Reusable Ant Design confirm modal
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── equipment/
│   │       ├── EquipmentCard.tsx
│   │       └── StockInfo.tsx
│   │
│   ├── services/                    # Axios API wrappers
│   │   ├── http.ts                  # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── equipment.service.ts
│   │   ├── borrow-request.service.ts
│   │   └── notification.service.ts
│   │
│   ├── stores/                      # Zustand global stores
│   │   ├── auth.store.ts            # currentUser, token, login(), logout()
│   │   └── notification.store.ts   # unread count
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useNotifications.ts
│   │   └── useEquipmentList.ts
│   │
│   ├── utils/
│   │   ├── format.ts                # formatDate, formatStatus, formatFileSize
│   │   └── error.ts                 # extractApiError for display
│   │
│   ├── constants/
│   │   └── routes.constant.ts       # All route paths as constants
│   │
│   └── typings/
│       └── global.d.ts
│
├── .env
├── .umirc.ts
├── package.json
└── tsconfig.json
```

---

### Generate these frontend files:

**`src/services/http.ts`**
```typescript
import axios, { type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse } from '@equipment-mgmt/shared';

export const http = axios.create({
  baseURL: process.env.UMI_APP_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally → redirect to login
http.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => res,
  (err: AxiosError<ApiResponse>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
```

**`src/stores/auth.store.ts`**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@equipment-mgmt/shared';

interface AuthUser {
  id:       number;
  fullName: string;
  email:    string;
  role:     UserRole;
}

interface AuthStore {
  user:    AuthUser | null;
  token:   string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout:  () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
);
```

**`src/components/common/StatusBadge.tsx`**
```typescript
import { Tag } from 'antd';
import { BorrowRequestStatus } from '@equipment-mgmt/shared';

const STATUS_CONFIG: Record<BorrowRequestStatus, { color: string; label: string }> = {
  [BorrowRequestStatus.PENDING]:      { color: 'gold',    label: 'Chờ duyệt' },
  [BorrowRequestStatus.APPROVED]:     { color: 'blue',    label: 'Đã duyệt' },
  [BorrowRequestStatus.BORROWING]:    { color: 'orange',  label: 'Đang mượn' },
  [BorrowRequestStatus.OVERDUE]:      { color: 'red',     label: 'Quá hạn' },
  [BorrowRequestStatus.UNDER_REVIEW]: { color: 'purple',  label: 'Đang kiểm tra' },
  [BorrowRequestStatus.RETURNED]:     { color: 'default', label: 'Đã trả' },
  [BorrowRequestStatus.REJECTED]:     { color: 'error',   label: 'Từ chối' },
  [BorrowRequestStatus.CANCELLED]:    { color: 'default', label: 'Đã hủy' },
};

interface Props {
  status: BorrowRequestStatus;
}

export function StatusBadge({ status }: Props) {
  const { color, label } = STATUS_CONFIG[status] ?? { color: 'default', label: status };
  return <Tag color={color}>{label}</Tag>;
}
```

**`src/utils/format.ts`**
```typescript
import dayjs from 'dayjs';

export const formatDate  = (d: string | Date) => dayjs(d).format('DD/MM/YYYY');
export const formatDatetime = (d: string | Date) => dayjs(d).format('DD/MM/YYYY HH:mm');
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};
```

**`src/constants/routes.constant.ts`**
```typescript
export const ROUTES = {
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Student
  EQUIPMENT:       '/equipment',
  EQUIPMENT_DETAIL:(id: number | string) => `/equipment/${id}`,
  BORROW_CREATE:   '/borrow-request/create',
  BORROW_HISTORY:  '/borrow-request',
  NOTIFICATIONS:   '/notifications',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_REQUESTS:  '/admin/requests',
  ADMIN_REQUEST:   (id: number | string) => `/admin/requests/${id}`,
  ADMIN_EQUIPMENT: '/admin/equipment',
  ADMIN_USERS:     '/admin/users',
  ADMIN_REPORTS:   '/admin/reports',
} as const;
```

**`.umirc.ts`**
```typescript
import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'pnpm',
  routes: [
    { path: '/login',           component: 'login' },
    { path: '/register',        component: 'register' },
    { path: '/forgot-password', component: 'forgot-password' },
    {
      path: '/',
      component: '@/layouts/StudentLayout',
      routes: [
        { path: 'equipment',         component: 'equipment/index' },
        { path: 'equipment/:id',     component: 'equipment/[id]' },
        { path: 'borrow-request',    component: 'borrow-request/index' },
        { path: 'borrow-request/create', component: 'borrow-request/create' },
        { path: 'notifications',     component: 'notifications/index' },
      ],
    },
    {
      path: '/admin',
      component: '@/layouts/AdminLayout',
      routes: [
        { path: 'dashboard',   component: 'admin/dashboard/index' },
        { path: 'requests',    component: 'admin/requests/index' },
        { path: 'requests/:id',component: 'admin/requests/[id]' },
        { path: 'equipment',   component: 'admin/equipment/index' },
        { path: 'users',       component: 'admin/users/index' },
        { path: 'reports',     component: 'admin/reports/index' },
      ],
    },
    { path: '/', redirect: '/equipment' },
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
});
```

**`package.json` (apps/web)**
```json
{
  "name": "@equipment-mgmt/web",
  "scripts": {
    "dev":   "umi dev",
    "build": "umi build",
    "lint":  "umi lint"
  },
  "dependencies": {
    "umi": "^4.3.0",
    "@umijs/max": "^4.3.0",
    "antd": "^5.19.0",
    "axios": "^1.7.2",
    "zustand": "^4.5.4",
    "dayjs": "^1.11.12",
    "zod": "^3.23.8",
    "@equipment-mgmt/shared": "workspace:*"
  }
}
```

---

## ⚙️ ROOT CONFIG FILES

**`pnpm-workspace.yaml`**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**`tsconfig.base.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**`package.json` (root)**
```json
{
  "name": "equipment-management",
  "private": true,
  "scripts": {
    "dev:api": "pnpm --filter @equipment-mgmt/api dev",
    "dev:web": "pnpm --filter @equipment-mgmt/web dev",
    "dev":     "pnpm --parallel dev:api dev:web",
    "build":   "pnpm --recursive build",
    "lint":    "pnpm --recursive lint"
  }
}
```

**`.prettierrc`**
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

---

## 📐 CODING CONVENTIONS — ALL MEMBERS MUST FOLLOW

### Naming
| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `create-borrow-request.use-case.ts` |
| Classes | PascalCase | `CreateBorrowRequestUseCase` |
| Interfaces | `I` prefix | `IBorrowRequestRepository` |
| Enums | PascalCase | `BorrowRequestStatus` |
| React components | PascalCase | `StatusBadge.tsx` |
| Hooks | camelCase + `use` prefix | `useEquipmentList.ts` |
| Stores | camelCase + `Store` suffix | `auth.store.ts` |

### Backend patterns
- **One use case = one file = one class** with a single `execute()` method
- Controllers call use cases only — **no business logic in controllers**
- Repositories only do SQL — **no business logic in repositories**
- All SQL goes inside repository implementations — **never inline SQL in use cases**
- Always use `pg` transactions for operations that touch multiple tables
- Every endpoint returns `ApiResponse<T>` from shared package

### Frontend patterns
- **One API feature = one service file** in `src/services/`
- Global state (user, notifications) → Zustand store
- Server state (lists, detail) → Umi `useRequest` hook
- **No `any` type** — ever
- All date formatting → `formatDate()` / `formatDatetime()` from utils
- All status badges → `<StatusBadge />` component — never hardcode colors inline

### Adding a new feature (checklist for team members)
1. Add/update Zod schema in `packages/shared/src/schemas/`
2. Add entity in `apps/api/src/domain/entities/`
3. Add repository interface in `apps/api/src/domain/repositories/`
4. Implement repository in `apps/api/src/infrastructure/database/repositories/`
5. Wire in `apps/api/src/infrastructure/container.ts`
6. Write use case in `apps/api/src/application/use-cases/<feature>/`
7. Add controller method in `apps/api/src/presentation/controllers/`
8. Add route in `apps/api/src/presentation/routes/`
9. Add API service function in `apps/web/src/services/`
10. Build page/component in `apps/web/src/pages/`

---

## 🗄 DATABASE MIGRATION

Generate file `apps/api/src/infrastructure/database/migrations/001_initial_schema.sql`
containing the full PostgreSQL DDL for these tables in order:

1. `users`
2. `password_reset_tokens`
3. `categories`
4. `equipment`
5. `equipment_instances`
6. `borrow_requests`
7. `borrow_request_items`
8. `borrow_records`
9. `borrow_record_instances`
10. `violations`
11. `equipment_stock_logs`
12. `notifications`
13. `email_logs`

Use `CREATE TYPE` for every PostgreSQL enum before the tables.
Add `CREATE INDEX` for all foreign keys and frequently filtered columns:
`borrow_requests.status`, `borrow_requests.user_id`,
`equipment.status`, `notifications.user_id + is_read`,
`equipment_stock_logs.equipment_id`.

---

## ✅ BOILERPLATE COMPLETENESS CHECKLIST

After generation, verify these exist:

- [ ] `pnpm install` runs without error from root
- [ ] `pnpm dev:api` starts Express on port 3000
- [ ] `pnpm dev:web` starts UmiJS on port 8000
- [ ] `GET /health` returns `{ status: "ok" }`
- [ ] All enums in `packages/shared` match DB schema exactly
- [ ] `container.ts` wires all use cases without circular imports
- [ ] Cron jobs registered with correct Vietnam timezone
- [ ] `.env.example` contains all required variables
- [ ] `001_initial_schema.sql` creates all 13 tables with correct FK constraints
- [ ] All TypeScript files compile with `tsc --noEmit` without errors
