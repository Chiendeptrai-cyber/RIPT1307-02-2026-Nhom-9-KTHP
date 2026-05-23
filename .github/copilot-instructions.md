# COPILOT PROMPT — Equipment Borrowing & Return Management System Boilerplate
# Development Guide for Team Members

---

## 🎯 PROJECT CONTEXT

You are developing features for a production-grade **Equipment Borrowing & Return Management System** (Hệ thống Quản lý Mượn Trả Thiết Bị).

**Two actors:** 
- **Student** (borrower) — browse equipment, create borrow requests, track status
- **Admin** (manager) — approve/reject requests, manage inventory, track violations, generate reports

**Core flows:** 
- Authentication (login / register / password reset)
- Equipment browsing & stock management
- Borrow request lifecycle: `pending` → `approved` → `borrowing` → `returned`
- Violation tracking (late return, damaged, lost)
- Notifications & scheduled jobs
- Reporting & dashboard

---

## 🛠 TECH STACK — EXACT VERSIONS (DO NOT CHANGE)

| Layer      | Technology                            | Version |
|------------|---------------------------------------|---------|
| Runtime    | Node.js                               | 20+     |
| Language   | TypeScript                            | 5.x     |
| **ALL** files must be `.ts` or `.tsx` — **no `.js` allowed** | | |
| Frontend   | UmiJS + React + Ant Design            | 4.x, 18, 5.x |
| Backend    | Express.js                            | 4.x     |
| Database   | PostgreSQL + `pg` driver              | 14+     |
| Monorepo   | pnpm workspaces                       | 8.8.0   |
| Validation | Zod (shared FE & BE)                  | 3.x     |
| Auth       | JWT + bcryptjs                        | -       |
| Email      | Nodemailer (SMTP)                     | -       |
| Scheduler  | node-cron (Vietnam timezone)          | -       |
| HTTP       | Axios (frontend only)                 | -       |
| State      | Zustand (frontend only)               | -       |
| Linting    | ESLint + Prettier                     | -       |

---

## 📁 CURRENT MONOREPO STRUCTURE (ALREADY GENERATED)

```
equipment-management/
├── .github/
│   └── copilot-instructions.md                    ← This file
├── apps/
│   ├── api/                                       ✅ Express backend (clean architecture)
│   │   ├── src/
│   │   │   ├── domain/                           ✅ Entities, errors, repository interfaces
│   │   │   ├── application/use-cases/            ⚠️ Only 3/15 use-cases created
│   │   │   ├── infrastructure/                   ✅ DB repos, services, scheduler, container
│   │   │   ├── presentation/                     ✅ Controllers, routes, middleware
│   │   │   ├── app.ts                            ✅ Express app factory
│   │   │   └── server.ts                         ✅ Entry point (listen + cron start)
│   │   ├── .env.example                          ✅ Config template
│   │   ├── package.json                          ✅ Dependencies
│   │   └── tsconfig.json                         ✅ TypeScript config
│   │
│   └── web/                                       ✅ UmiJS frontend
│       ├── src/
│       │   ├── pages/                            ✅ All route pages (15+ pages)
│       │   ├── layouts/                          ✅ AuthLayout, StudentLayout, AdminLayout
│       │   ├── components/                       ✅ Common & equipment components
│       │   ├── services/                         ✅ HTTP wrappers (auth, equipment, etc.)
│       │   ├── stores/                           ✅ Zustand (auth.store.ts)
│       │   ├── hooks/                            ✅ useAuth, useNotifications, useEquipmentList
│       │   ├── utils/                            ✅ format.ts (dates, status, file size)
│       │   ├── constants/                        ✅ routes.constant.ts
│       │   └── typings/                          ✅ global.d.ts (process.env, React globals)
│       ├── .umirc.ts                             ✅ UmiJS routing config
│       ├── .env                                  ✅ API base URL
│       ├── package.json                          ✅ Dependencies
│       └── tsconfig.json                         ✅ TypeScript config
│
├── packages/
│   └── shared/                                    ✅ Shared types, schemas, enums (zero runtime deps)
│       ├── src/
│       │   ├── enums/                            ✅ All enum types matching DB schema
│       │   ├── schemas/                          ✅ Zod validation schemas (source of truth)
│       │   ├── types/                            ✅ ApiResponse<T>, PaginatedResponse<T>
│       │   ├── constants/                        ✅ Business rules & limits
│       │   └── index.ts                          ✅ Barrel export
│       ├── package.json                          ✅ Only Zod + TypeScript devDeps
│       └── tsconfig.json                         ✅ TypeScript config
│
├── .eslintrc.base.js                             ✅ Shared linting rules
├── .prettierrc                                   ✅ Code formatting
├── tsconfig.base.json                            ✅ Shared TypeScript base config
├── pnpm-workspace.yaml                           ✅ Workspace definition
├── package.json                                  ✅ Root scripts only (dev, build, lint)
├── pnpm-lock.yaml                                ✅ Dependency lock file
└── README.md                                     ✅ Project documentation
```

---

## ✅ WHAT'S DONE

- ✅ Monorepo setup (pnpm workspaces)
- ✅ All configuration files (tsconfig, eslint, prettier, .env.example)
- ✅ Shared package (enums, types, schemas, constants)
- ✅ Express backend skeleton (clean architecture layers)
- ✅ UmiJS frontend skeleton (pages, layouts, components, services, stores)
- ✅ Database schema (13 tables with PostgreSQL enums, indexes, FK constraints)
- ✅ Middleware (authentication, authorization, validation, error handling)
- ✅ Dependency injection container
- ✅ Scheduler setup (cron jobs with Vietnam timezone)
- ✅ 3 sample use-cases (login, register, create-borrow-request)
- ✅ All TypeScript compilation passing

---

## ⚠️ WHAT NEEDS TO BE COMPLETED

### Backend: Missing Use-Cases (12 remaining)

#### Auth (2 more)
- [ ] `apps/api/src/application/use-cases/auth/forgot-password.use-case.ts`
- [ ] `apps/api/src/application/use-cases/auth/reset-password.use-case.ts`

#### Equipment (5)
- [ ] `apps/api/src/application/use-cases/equipment/list-equipment.use-case.ts`
- [ ] `apps/api/src/application/use-cases/equipment/get-equipment-detail.use-case.ts`
- [ ] `apps/api/src/application/use-cases/equipment/create-equipment.use-case.ts`
- [ ] `apps/api/src/application/use-cases/equipment/update-equipment.use-case.ts`
- [ ] `apps/api/src/application/use-cases/equipment/delete-equipment.use-case.ts`
- [ ] `apps/api/src/application/use-cases/equipment/update-stock.use-case.ts`

#### Borrow Request (6 more)
- [ ] `apps/api/src/application/use-cases/borrow-request/cancel-borrow-request.use-case.ts`
- [ ] `apps/api/src/application/use-cases/borrow-request/approve-borrow-request.use-case.ts`
- [ ] `apps/api/src/application/use-cases/borrow-request/reject-borrow-request.use-case.ts`
- [ ] `apps/api/src/application/use-cases/borrow-request/checkout-borrow-request.use-case.ts`
- [ ] `apps/api/src/application/use-cases/borrow-request/return-equipment.use-case.ts`
- [ ] `apps/api/src/application/use-cases/borrow-request/extend-borrow-request.use-case.ts`
- [ ] `apps/api/src/application/use-cases/borrow-request/undo-return.use-case.ts`

#### Notification (2)
- [ ] `apps/api/src/application/use-cases/notification/list-notifications.use-case.ts`
- [ ] `apps/api/src/application/use-cases/notification/mark-notification-read.use-case.ts`

#### Report (2)
- [ ] `apps/api/src/application/use-cases/report/get-dashboard-stats.use-case.ts`
- [ ] `apps/api/src/application/use-cases/report/export-report.use-case.ts`

#### User (3)
- [ ] `apps/api/src/application/use-cases/user/list-users.use-case.ts`
- [ ] `apps/api/src/application/use-cases/user/lock-user.use-case.ts`
- [ ] `apps/api/src/application/use-cases/user/get-user-profile.use-case.ts`

### Backend: Missing Implementation Details
- [ ] Implement all **repository methods** (currently stubbed)
- [ ] Implement all **controller methods** (currently stubbed)
- [ ] Wire use-cases in `container.ts` (only 3 currently wired)
- [ ] Implement **job files** (`due-reminder.job.ts`, `overdue-check.job.ts`)
- [ ] Implement **service implementations** (JWT, Email, Storage)

### Frontend: API Service Implementations
- [ ] Implement missing methods in service files (currently stubbed)
- [ ] Add proper error handling in HTTP interceptors
- [ ] Implement notification polling/WebSocket (if needed)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Clean Architecture Layers (Backend)

```
Domain Layer (Entities, Repository Interfaces, Errors)
    ↓
Application Layer (Use Cases — business logic)
    ↓
Infrastructure Layer (Database Repos, Services, Jobs, DI Container)
    ↓
Presentation Layer (Controllers, Routes, Middleware)
```

**Key Rule:** Each layer only imports from layers below it. Controllers call use-cases only (no SQL). Repositories do SQL only (no business logic).

---

## 📝 NAMING CONVENTIONS (MANDATORY FOR TEAM)

| Item | Convention | Example |
|---|---|---|
| **Files** | kebab-case | `create-borrow-request.use-case.ts` |
| **Classes** | PascalCase | `CreateBorrowRequestUseCase` |
| **Interfaces** | `I` prefix + PascalCase | `IBorrowRequestRepository` |
| **Enums** | PascalCase | `BorrowRequestStatus` |
| **React Components** | PascalCase | `StatusBadge.tsx` |
| **Functions/Methods** | camelCase | `formatDate()`, `handleSubmit()` |
| **Variables** | camelCase | `userId`, `isAdmin`, `userData` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_BORROW_DAYS`, `SESSION_DURATION_HOURS` |
| **Hooks** | `use` prefix + camelCase | `useAuth()`, `useEquipmentList()` |
| **Stores** | camelCase + `Store` suffix | `auth.store.ts`, `notification.store.ts` |
| **Services** | kebab-case + `.service.ts` | `equipment.service.ts`, `borrow-request.service.ts` |

---

## 🔧 ADDING A NEW FEATURE (STEP-BY-STEP FOR TEAM MEMBERS)

When adding a new feature (e.g., "Lock User Account"), follow this **exact** sequence:

### 1. **Shared Package** (if new status/enum needed)
```
packages/shared/src/enums/user.enum.ts  — add UserStatus.LOCKED if not exists
packages/shared/src/schemas/             — add Zod schema for request/response if needed
packages/shared/src/types/               — add TypeScript interface if needed
packages/shared/src/constants/           — add business rules if needed
```

### 2. **Database** (if new table/column)
```
apps/api/src/infrastructure/database/migrations/002_add_feature.sql
— Create types, tables, indexes (increment migration number)
```

### 3. **Domain Layer**
```
apps/api/src/domain/entities/        — Create/update entity DTO
apps/api/src/domain/repositories/    — Create repository interface (no implementation)
apps/api/src/domain/errors/          — Add custom error if needed (e.g., UserLockedError)
```

### 4. **Application Layer**
```
apps/api/src/application/use-cases/feature/  — Create use-case with single execute() method
— Only business logic, no SQL, no HTTP details
— Imports repository interfaces (not implementations)
```

### 5. **Infrastructure Layer**
```
apps/api/src/infrastructure/database/repositories/  — Implement repository interface
— SQL queries ONLY, no business logic
apps/api/src/infrastructure/services/               — Implement service (JWT, Email, etc.) if needed
apps/api/src/infrastructure/container.ts            — Wire use-case + repositories
```

### 6. **Presentation Layer**
```
apps/api/src/presentation/controllers/feature.controller.ts
— Call use-case.execute()
— Return ApiResponse<T> from @equipment-mgmt/shared
— No SQL, no business logic

apps/api/src/presentation/routes/feature.route.ts  (or add to existing route)
— Mount route + apply middleware (authenticate, authorize, validate)

apps/api/src/presentation/middlewares/               — Add if needed (e.g., roleGuard)
```

### 7. **Frontend** (if needed)
```
apps/web/src/services/feature.service.ts            — Add API client method
apps/web/src/stores/feature.store.ts                — Add Zustand store if state needed
apps/web/src/pages/feature/                         — Create page(s)
apps/web/src/components/feature/                    — Create reusable components
```

### 8. **Wire & Test**
```
bash
corepack pnpm@8.8.0 --filter @equipment-mgmt/api exec tsc --noEmit    # Verify no TS errors
corepack pnpm@8.8.0 dev:api                                            # Test endpoint
curl http://localhost:3000/api/v1/health                               # Verify health check
```

---

## 💻 BACKEND PATTERNS & EXAMPLES

### Use-Case Template (Business Logic)

```typescript
// apps/api/src/application/use-cases/auth/login.use-case.ts
import { LoginDto } from '@equipment-mgmt/shared';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import type { JwtTokenService } from '../../infrastructure/services/jwt-token.service';

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: JwtTokenService,
  ) {}

  async execute(dto: LoginDto): Promise<{ user: UserEntity; token: string }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !await bcryptjs.compare(dto.password, user.passwordHash)) {
      throw new InvalidCredentialsError();
    }
    
    const token = this.tokenService.sign({ userId: user.id, role: user.role });
    return { user, token };
  }
}
```

### Repository Pattern (Data Access)

```typescript
// apps/api/src/domain/repositories/user.repository.ts — INTERFACE ONLY
export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>;
  findAll(page: number, pageSize: number): Promise<{ items: UserEntity[]; total: number }>;
}

// apps/api/src/infrastructure/database/repositories/pg-user.repository.ts — IMPLEMENTATION
import type { Pool } from 'pg';
export class PgUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  }
  // ... rest of SQL queries
}
```

### Controller Pattern (HTTP Handler)

```typescript
// apps/api/src/presentation/controllers/auth.controller.ts
import type { Request, Response } from 'express';
import { loginUseCase } from '../../infrastructure/container';
import type { ApiResponse } from '@equipment-mgmt/shared';

export async function login(req: Request, res: Response): Promise<void> {
  const { user, token } = await loginUseCase.execute(req.body);
  
  res.status(200).json({
    success: true,
    data: { user, token },
    message: 'Login successful',
  } satisfies ApiResponse);
}
```

### Route Pattern (Endpoint Definition)

```typescript
// apps/api/src/presentation/routes/auth.route.ts
import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '@equipment-mgmt/shared';

const router = Router();
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;
```

---

## 🌐 FRONTEND PATTERNS & EXAMPLES

### Service Pattern (API Client)

```typescript
// apps/web/src/services/equipment.service.ts
import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export const equipmentService = {
  list(page: number, pageSize: number = 20) {
    return http.get<ApiResponse<PaginatedResponse<Equipment>>>('/equipment', {
      params: { page, pageSize },
    });
  },
  
  getDetail(id: number) {
    return http.get<ApiResponse<Equipment>>(`/equipment/${id}`);
  },
};
```

### Zustand Store Pattern (State Management)

```typescript
// apps/web/src/stores/notification.store.ts
import { create } from 'zustand';

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
}));
```

### React Hook Pattern

```typescript
// apps/web/src/hooks/useEquipmentList.ts
import { useEffect, useState } from 'react';
import { equipmentService } from '../services/equipment.service';

export function useEquipmentList(page: number = 1) {
  const [data, setData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await equipmentService.list(page);
        setData(res.data.data?.items ?? []);
      } catch (err) {
        setError((err as any)?.message ?? 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return { data, loading, error };
}
```

### Component Pattern

```typescript
// apps/web/src/components/common/StatusBadge.tsx
import { Tag } from 'antd';
import type { BorrowRequestStatus } from '@equipment-mgmt/shared';

const STATUS_CONFIG: Record<BorrowRequestStatus, { color: string; label: string }> = {
  pending: { color: 'gold', label: 'Chờ duyệt' },
  approved: { color: 'blue', label: 'Đã duyệt' },
  // ... rest
};

export function StatusBadge({ status }: { status: BorrowRequestStatus }) {
  const { color, label } = STATUS_CONFIG[status];
  return <Tag color={color}>{label}</Tag>;
}
```

---

## 🔐 AUTHENTICATION FLOW

1. **Login Request**
   - User submits `{ email, password }`
   - Backend verifies password with bcryptjs
   - Backend generates JWT (access token, 8 hours) + refresh token (7 days)
   - Frontend stores JWT in localStorage → cookie (secure, httpOnly recommended)

2. **Protected Requests**
   - Frontend includes `Authorization: Bearer <JWT>` header
   - `authenticate` middleware verifies JWT
   - `authorize` middleware checks role (admin/student)

3. **Token Refresh**
   - When JWT expires, frontend sends refresh token
   - Backend issues new JWT + new refresh token (rotation)
   - Never reuse old refresh token

4. **Logout**
   - Frontend removes token from localStorage
   - Frontend redirects to `/login`

---

## ⏰ DATABASE SCHEMA (13 Tables)

All tables auto-created via migration `001_initial_schema.sql`:

1. `users` — Students & staff
2. `password_reset_tokens` — Recovery tokens
3. `categories` — Equipment categories
4. `equipment` — Equipment master
5. `equipment_instances` — Individual items
6. `borrow_requests` — Requests from users
7. `borrow_request_items` — Line items per request
8. `borrow_records` — Actual transactions
9. `borrow_record_instances` — Item tracking
10. `violations` — Infractions (late, damage, loss)
11. `equipment_stock_logs` — Audit trail
12. `notifications` — User notifications
13. `email_logs` — Email audit trail

**Enums (PostgreSQL):**
- `user_role` → `student`, `admin`
- `user_status` → `active`, `borrow_blocked`, `locked`
- `equipment_status` → `active`, `under_maintenance`, `deleted`
- `instance_condition` → `good`, `reserved`, `borrowed`, `damaged`, `lost`, `under_repair`
- `borrow_request_status` → `pending`, `approved`, `rejected`, `cancelled`, `borrowing`, `overdue`, `under_review`, `returned`
- `borrow_record_status` → `borrowed`, `partial_returned`, `returned`, `overdue`
- `violation_type` → `late_return`, `damaged`, `lost`
- `stock_action_type` → `import`, `mark_damaged`, `mark_lost`, `repaired`, `adjustment`, `borrow_approve`, `borrow_return`, `borrow_cancel`
- `notification_type` → `new_request`, `approved`, `rejected`, `checkout_confirmed`, `return_confirmed`, `due_reminder`, `overdue_alert`
- `email_log_type` → `approved`, `rejected`, `checkout_confirmed`, `due_reminder`, `overdue_alert`
- `email_send_status` → `pending`, `sent`, `failed`

---

## 🤖 SCHEDULED JOBS (node-cron)

**Timezone:** Vietnam (`Asia/Ho_Chi_Minh`), not system timezone.

**Jobs registered in `apps/api/src/infrastructure/jobs/scheduler.ts`:**

### 1. Due Reminder Job
- **Schedule:** 08:00 daily
- **Task:** Check borrow records with `expected_return_date` within 1–3 days
- **Action:** Create notifications + send emails
- **File:** `due-reminder.job.ts`

### 2. Overdue Check Job
- **Schedule:** 09:00 daily
- **Task:** Check borrow records with `expected_return_date` < NOW()
- **Action:** Update `borrow_records.status` to `overdue`, create notifications
- **File:** `overdue-check.job.ts`

---

## ✅ QUALITY CHECKLIST BEFORE COMMITTING

Every commit to `main` must pass:

- [ ] **TypeScript Compilation**
  ```bash
  corepack pnpm@8.8.0 --filter @equipment-mgmt/api exec tsc --noEmit
  corepack pnpm@8.8.0 --filter @equipment-mgmt/web exec tsc --noEmit
  ```

- [ ] **Linting**
  ```bash
  corepack pnpm@8.8.0 lint
  ```

- [ ] **Health Check**
  ```bash
  corepack pnpm@8.8.0 dev:api &
  sleep 3
  curl http://localhost:3000/api/v1/health
  # Expected: { "status": "ok" }
  ```

- [ ] **File Naming**
  - All files are `.ts` or `.tsx` — **never `.js`**
  - All filenames are kebab-case or PascalCase (not camelCase)

- [ ] **No `any` Type**
  - Every variable, parameter, return type must have explicit TypeScript type
  - Use `unknown` as last resort, not `any`

- [ ] **Shared Package Imports**
  - All DTO, enum, schema imports come from `@equipment-mgmt/shared`
  - No hardcoded status strings — use enums from shared

- [ ] **API Response Format**
  - All endpoint responses follow `ApiResponse<T>` structure from shared
  - Every endpoint returns `{ success, data, message, code?, errors? }`

- [ ] **Error Handling**
  - All errors extend `AppError`
  - Controllers wrap use-cases in try-catch
  - Error handler middleware catches all unhandled errors

- [ ] **Database Transactions**
  - Multi-table operations use `BEGIN…COMMIT…ROLLBACK`
  - No orphaned records

- [ ] **Tests Running** (add later if required)
  - All unit tests pass
  - All integration tests pass

---

## 📞 SUPPORT & QUESTIONS

When you need to:

1. **Add a feature**
   - Follow "Adding a New Feature" section above
   - Ensure TypeScript compiles
   - Test locally before push

2. **Fix a bug**
   - Write test case first
   - Identify root cause in domain/application/infrastructure layer
   - Fix and re-test

3. **Refactor code**
   - Maintain architectural layers
   - Update types in shared package first
   - Test all affected endpoints

4. **Ask Copilot for help**
   - Reference this file: `.github/copilot-instructions.md`
   - Provide the current error or code snippet
   - Ask for specific implementation (e.g., "implement login.use-case.ts")

---

## 🚀 QUICK START FOR NEW TEAM MEMBERS

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd equipment-management
   corepack pnpm@8.8.0 install
   ```

2. **Setup PostgreSQL**
   ```bash
   createdb equipment_mgmt
   psql -U postgres -d equipment_mgmt < apps/api/src/infrastructure/database/migrations/001_initial_schema.sql
   ```

3. **Configure `.env`**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your DB credentials, JWT secret, SMTP settings
   ```

4. **Start Development**
   ```bash
   corepack pnpm@8.8.0 dev      # Starts API + Frontend
   # API: http://localhost:3000/api/v1
   # Web: http://localhost:8000
   ```

5. **Verify Health**
   ```bash
   curl http://localhost:3000/api/v1/health
   # Should return: { "status": "ok" }
   ```

---

**Last Updated:** 2026-05-23  
**Team:** Equipment Management System Development Team  
**Status:** ✅ Boilerplate Complete | ⚠️ Use-Cases Pending Implementation
