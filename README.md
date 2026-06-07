Tai khoan admin : Admin@ptit.edu.vn / password : password
Tai khoan user: user@ptit.edu.vn / password: 12345678




# Equipment Borrowing & Return Management System - Monorepo Boilerplate

Production-grade monorepo boilerplate for an Equipment Borrowing & Return Management System built with **Node.js 24**, **TypeScript 5.5**, **Express 4**, **UmiJS 4**, **React 18**, **PostgreSQL**, **Zod**, and **pnpm workspaces**.

## 📋 Project Structure

```
├── apps/
│   ├── api/                          # Express backend (Clean Architecture)
│   │   ├── src/
│   │   │   ├── domain/               # Entities & Repository interfaces
│   │   │   ├── application/          # Use cases (business logic)
│   │   │   ├── infrastructure/       # DB repos, services, jobs, scheduler
│   │   │   ├── presentation/         # Controllers, routes, middleware
│   │   │   ├── app.ts                # Express app factory
│   │   │   └── server.ts             # Server entry point
│   │   ├── .env.example              # Configuration template
│   │   └── tsconfig.json
│   │
│   └── web/                          # UmiJS frontend
│       ├── src/
│       │   ├── pages/                # Route pages (auto-routing)
│       │   ├── layouts/              # Layouts (AuthLayout, StudentLayout, AdminLayout)
│       │   ├── components/           # Reusable components
│       │   ├── services/             # HTTP & business logic service layer
│       │   ├── stores/               # Zustand stores (auth)
│       │   ├── hooks/                # Custom React hooks
│       │   ├── utils/                # Utilities (formatting, etc.)
│       │   ├── constants/            # Constants & route definitions
│       │   └── typings/              # Global type definitions
│       ├── .umirc.ts                 # UmiJS configuration
│       └── tsconfig.json
│
├── packages/
│   └── shared/                       # Shared types, schemas, enums, constants
│       └── src/
│           ├── enums/                # UserRole, EquipmentStatus, etc.
│           ├── constants/            # Business rules
│           ├── types/                # ApiResponse<T>, PaginatedResponse<T>
│           └── schemas/              # Zod validation schemas
│
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml               # pnpm workspaces definition
├── tsconfig.base.json                # Shared TypeScript config
├── .prettierrc                        # Code formatting
├── .eslintrc.base.js                 # Linting config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (uses corepack pnpm@8.8.0)
- **PostgreSQL 14+**

### Setup

```bash
# Install dependencies (auto-uses pnpm@8.8.0 via corepack)
corepack pnpm@8.8.0 install

# Start both API and web in development mode
corepack pnpm@8.8.0 dev

# Or start individually:
corepack pnpm@8.8.0 dev:api    # http://localhost:3000/api/v1
corepack pnpm@8.8.0 dev:web    # http://localhost:8000
```

### Build & Deploy

```bash
# Build all packages
corepack pnpm@8.8.0 build

# Lint entire workspace
corepack pnpm@8.8.0 lint
```

## 📦 Technology Stack

### Backend (API)
- **Express 4.x** - HTTP server & routing
- **PostgreSQL + pg** - Database
- **jsonwebtoken** - JWT auth with refresh token rotation
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **node-cron** - Job scheduling (Vietnam timezone)
- **nodemailer** - Email notifications
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **Prisma** (optional, for migrations)

### Frontend (Web)
- **UmiJS 4.x** - React framework with built-in routing
- **React 18** - UI components
- **Ant Design 5.x** - UI component library
- **Axios** - HTTP client
- **Zustand** - State management
- **dayjs** - Date/time utilities
- **Zod** - Client-side validation

### Shared Package
- **Zod 3.x** - Schema validation (single source of truth)
- **TypeScript 5.5** - Type safety across all packages

## 🏗️ Architecture Patterns

### Backend (Clean Architecture)
```
Domain Layer (Entities, Repositories)
    ↓
Application Layer (Use Cases)
    ↓
Infrastructure Layer (DB Repos, Services, Jobs)
    ↓
Presentation Layer (Controllers, Routes, Middleware)
```

### Enums & Constants (Shared)
All enums (UserRole, EquipmentStatus, BorrowRequestStatus, etc.) are defined in `packages/shared`, ensuring consistency across backend and frontend.

### API Response Contract
All endpoints return a standardized response:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
```

### Authentication
- **JWT + Refresh Token Rotation**
  - Access token: 8 hours
  - Refresh token: 7 days (auto-rotates on use)
  - Token blacklist in Redis (optional)

### Database
- **Per-service schema** with migrations in `apps/api/src/infrastructure/database/migrations/`
- **Migrations** use raw PostgreSQL (no ORM required for simple queries)
- **Enums** defined as PostgreSQL ENUM types
- **Indexes** on all filter/search columns

### Validation
- **Schema-driven** with Zod for all inputs
- **Single source of truth** in `packages/shared/schemas/`
- **Consistent error messages** across all endpoints

### Jobs & Scheduling
- **node-cron** for scheduled tasks (Vietnam timezone `Asia/Ho_Chi_Minh`)
- Examples:
  - Check overdue borrow records daily
  - Send reminder emails
  - Clean up expired tokens

## 📝 Key Files

### Shared Package
- `packages/shared/src/enums/` - All enum types
- `packages/shared/src/schemas/` - Zod validation schemas
- `packages/shared/src/types/` - TypeScript interfaces
- `packages/shared/src/constants/` - Business rules

### API
- `apps/api/src/app.ts` - Express app factory with middleware setup
- `apps/api/src/server.ts` - Server entry point
- `apps/api/src/infrastructure/database/migrations/001_initial_schema.sql` - Initial schema with 13 tables
- `apps/api/src/presentation/routes/` - Grouped route handlers
- `.env.example` - Configuration template

### Frontend
- `apps/web/.umirc.ts` - UmiJS configuration
- `apps/web/src/pages/` - Auto-routed pages
- `apps/web/src/services/http.ts` - Axios instance with interceptors
- `apps/web/src/stores/auth.store.ts` - Auth state (Zustand)

## ✅ Features Included

- ✅ TypeScript configuration (tsconfig.base.json, per-package configs)
- ✅ Shared enums, types, schemas, constants
- ✅ Express backend with clean architecture
- ✅ UmiJS frontend with auto-routing
- ✅ Ant Design UI components
- ✅ JWT authentication with refresh token rotation
- ✅ Password hashing (bcryptjs)
- ✅ Zod validation for all inputs
- ✅ PostgreSQL migration script (13 tables, indexes, enums)
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Job scheduler (node-cron, Vietnam timezone)
- ✅ Email service (nodemailer)
- ✅ Zustand state management
- ✅ Axios HTTP client with interceptors
- ✅ ESLint & Prettier configuration
- ✅ pnpm workspaces setup
- ✅ Full TypeScript compilation (PASS)

## 🔧 Environment Variables

### API (.env)
See `apps/api/.env.example`:
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

### Frontend (.env)
See `apps/web/.env`:
```
UMI_APP_API_URL=http://localhost:3000/api/v1
```

## 📚 Database Schema

13 tables with full referential integrity:
- `users` - Students & staff
- `equipment` - Equipment master
- `equipment_instances` - Individual items
- `borrow_requests` - Requests from users
- `borrow_request_items` - Line items per request
- `borrow_records` - Actual borrow transactions
- `borrow_record_instances` - Individual item tracking
- `violations` - Late return, damage, loss
- `equipment_stock_logs` - Audit trail
- `notifications` - User notifications
- `email_logs` - Email audit trail
- `password_reset_tokens` - Password recovery
- Plus enums and indexes for performance

See: `apps/api/src/infrastructure/database/migrations/001_initial_schema.sql`

## 🧪 Verify Setup

```bash
# Check TypeScript compilation
corepack pnpm@8.8.0 --filter @equipment-mgmt/api exec tsc --noEmit
corepack pnpm@8.8.0 --filter @equipment-mgmt/web exec tsc --noEmit

# Run linter
corepack pnpm@8.8.0 lint
```

## 📖 Next Steps

1. **Setup PostgreSQL Database**
   ```bash
   psql -U postgres -d equipment_mgmt < apps/api/src/infrastructure/database/migrations/001_initial_schema.sql
   ```

2. **Configure Environment Variables**
   - Copy `apps/api/.env.example` → `apps/api/.env`
   - Update DB credentials, JWT secret, SMTP settings

3. **Start Development**
   ```bash
   corepack pnpm@8.8.0 dev
   ```

4. **API Documentation**
   - Routes defined in `apps/api/src/presentation/routes/`
   - Controllers in `apps/api/src/presentation/controllers/`

5. **Frontend Pages**
   - Auto-routed from `apps/web/src/pages/`
   - Login, Register, Equipment List, Borrow Requests, Admin Dashboard

---

**Built with:** Node.js 24 | TypeScript 5.5 | Express 4 | UmiJS 4 | React 18 | PostgreSQL | pnpm

