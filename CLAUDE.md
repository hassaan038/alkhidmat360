# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Alkhidmat 360 — charity management CRM for donations, beneficiary applications, and volunteer coordination. npm workspaces monorepo: `client/` (React 19 + Vite) and `server/` (Express + Prisma + MySQL 8).

## Common Commands

Run from repo root. The `Makefile` is the primary entry point.

```bash
make setup           # install deps + prisma migrate deploy + generate
make dev             # concurrently: server (nodemon :5000) + client (vite :5173)
make db-migrate      # prompts for name; runs prisma migrate dev in server/
make db-seed         # node prisma/seed.js (upserts 4 test users, safe to re-run)
make db-reset        # prisma migrate reset --force (destructive, prompts)
make docker-up       # docker-compose up -d --build (MySQL on :3307)
make docker-down     # docker-compose down
make docker-logs     # docker-compose logs -f
make clean           # rm node_modules + dist
```

Single workspace:
- `cd server && npm run dev` — nodemon on `src/server.js`, port 5000
- `cd client && npm run dev` — Vite on port 5173
- `cd server && npm run db:studio` — Prisma Studio

Lint: `cd client && npm run lint`. No test suite exists.

Server requires `server/.env`:
```
DATABASE_URL=mysql://user:pass@localhost:3306/alkhidmat360
PORT=5000
NODE_ENV=development
SESSION_SECRET=<secret>
SESSION_NAME=alkhidmat_sid
CORS_ORIGIN=http://localhost:5173
```
Docker uses `*.env.docker` files (hostname `db` instead of `localhost`).

### Test / Seed Credentials
| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@alkhidmat360.com | admin123 |
| DONOR | donor@test.com | donor123 |
| BENEFICIARY | beneficiary@test.com | beneficiary123 |
| VOLUNTEER | volunteer@test.com | volunteer123 |

---

## Backend Architecture (`server/src/`)

### Layering rule — never skip layers

```
routes/*Routes.js
  → middleware (requireAuth, requireRole, validateRequest)
  → controllers/*Controller.js  (parse req, call service, return ApiResponse)
  → services/*Service.js        (all Prisma + business logic)
```

- Throw `new ApiError(status, message)` (from `utils/ApiResponse.js`) inside services for any user-facing failure.
- Wrap every async controller with `asyncHandler` (from `utils/asyncHandler.js`); errors bubble to the global handler in `app.js`.
- Validators live in `validators/*Validator.js` as Zod schemas; apply via `validateRequest(schema)` middleware which replaces `req.body` with the parsed result and returns 400 `{ errors: [{ field, message }] }` on failure.

### `app.js` — middleware stack & route mounting

```
CORS (credentials: true, origin from CORS_ORIGIN env)
express.json() + express.urlencoded()
express-mysql-session (MySQLStore, parses DATABASE_URL, auto-creates `sessions` table)
express-session (name: SESSION_NAME, maxAge: 24h, httpOnly, secure in prod, sameSite: lax)

GET  /                     → health check
POST /api/auth/*           → authRoutes
/api/donations/*           → donationRoutes
/api/applications/*        → applicationRoutes
/api/volunteers/*          → volunteerRoutes
/api/admin/*               → adminRoutes
/api/users/*               → userRoutes

404 handler → { success: false, message: 'Route not found' }
Global error handler → { success: false, message, stack? (dev only) }
```

### Sessions (critical)

Auth is **session-cookie**, not JWT. Login stores `req.session.userId` (Int) and `req.session.user` (object with `userType`). Both are read by middleware — always set both.

`express-mysql-session` auto-creates the `sessions` table; the Prisma `Session` model in `schema.prisma` is a schema artifact **not used** by the runtime store.

The client sends `withCredentials: true`; CORS must stay `credentials: true` with a specific origin (never wildcard).

Cookie name: `alkhidmat_sid` (from SESSION_NAME env). Logout calls `req.session.destroy()` and clears this cookie.

### Auth middleware (`middleware/authMiddleware.js`)

| Function | Checks | Throws |
|----------|--------|--------|
| `requireAuth` | `req.session.userId` exists | 401 |
| `requireRole(...roles)` | `req.session.user.userType` in allowedRoles | 403 |
| `requireAdmin` | `req.session.user.userType === 'ADMIN'` | 403 |

Validation middleware: `validateRequest(zodSchema)` (in `middleware/validationMiddleware.js`).

### Utilities (`utils/`)

- `asyncHandler(fn)` — wraps async route handlers, passes errors to `next()`
- `ApiResponse` class — `(statusCode, data, message)`, `success` auto-set from statusCode < 400
- `ApiError` class — extends Error, `(statusCode, message, errors=[])`, `success` always false

### Response contract

**All** responses: `{ success, statusCode, message, data?, errors? }`

Validation failures: 400 with `errors: [{ field, message }]`.

Client interceptor (in `api.js`) rejects with `{ message, errors, status }` — UI reads exactly these three keys.

---

## API Routes Reference

### `/api/auth`
| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST | `/signup` | public | signupSchema → authController.signup |
| POST | `/login` | public | loginSchema → authController.login |
| POST | `/logout` | requireAuth | authController.logout |
| GET | `/me` | requireAuth | authController.getCurrentUser |

### `/api/donations` (all require requireAuth + requireRole('DONOR'))
| Method | Path | Handler |
|--------|------|---------|
| POST | `/qurbani` | qurbaniDonationSchema → donationController.createQurbaniDonation |
| GET | `/qurbani` | donationController.getQurbaniDonations |
| POST | `/ration` | rationDonationSchema → donationController.createRationDonation |
| GET | `/ration` | donationController.getRationDonations |
| POST | `/skin-collection` | skinCollectionSchema → donationController.createSkinCollection |
| GET | `/skin-collection` | donationController.getSkinCollections |
| POST | `/orphan-sponsorship` | orphanSponsorshipSchema → donationController.createOrphanSponsorship |
| GET | `/orphan-sponsorship` | donationController.getOrphanSponsorships |

### `/api/applications` (all require requireAuth + requireRole('BENEFICIARY'))
| Method | Path | Handler |
|--------|------|---------|
| POST | `/loan` | loanApplicationSchema → applicationController.createLoanApplication |
| GET | `/loan` | applicationController.getLoanApplications |
| POST | `/ramadan-ration` | ramadanRationSchema → applicationController.createRamadanRationApplication |
| GET | `/ramadan-ration` | applicationController.getRamadanRationApplications |
| POST | `/orphan` | orphanRegistrationSchema → applicationController.createOrphanRegistration |
| GET | `/orphan` | applicationController.getOrphanRegistrations |

### `/api/volunteers` (all require requireAuth + requireRole('VOLUNTEER'))
| Method | Path | Handler |
|--------|------|---------|
| POST | `/task` | volunteerTaskSchema → volunteerController.createVolunteerTask |
| GET | `/task` | volunteerController.getVolunteerTasks |

### `/api/users` (requireAuth; user-type-filtered responses)
| Method | Path | Handler |
|--------|------|---------|
| GET | `/dashboard/stats` | userController.getDashboardStats |
| GET | `/dashboard/activities?limit=10` | userController.getRecentActivities |

### `/api/admin` (all require requireAuth + requireRole('ADMIN'))
| Method | Path | Handler |
|--------|------|---------|
| GET | `/stats` | adminController.getDashboardStats |
| POST | `/create-admin` | createAdminSchema → adminController.createAdmin |
| GET | `/donations/qurbani` | adminController.getQurbaniDonations |
| GET | `/donations/ration` | adminController.getRationDonations |
| GET | `/donations/skin-collection` | adminController.getSkinCollections |
| GET | `/donations/orphan-sponsorship` | adminController.getOrphanSponsorships |
| PATCH | `/donations/qurbani/:id/status` | statusUpdateSchema → adminController.updateQurbaniDonationStatus |
| PATCH | `/donations/ration/:id/status` | statusUpdateSchema → adminController.updateRationDonationStatus |
| PATCH | `/donations/skin-collection/:id/status` | statusUpdateSchema → adminController.updateSkinCollectionStatus |
| PATCH | `/donations/orphan-sponsorship/:id/status` | statusUpdateSchema → adminController.updateOrphanSponsorshipStatus |
| GET | `/applications/loan` | adminController.getLoanApplications |
| GET | `/applications/ramadan-ration` | adminController.getRamadanRationApplications |
| GET | `/applications/orphan` | adminController.getOrphanRegistrations |
| PATCH | `/applications/loan/:id/status` | statusUpdateSchema → adminController.updateLoanApplicationStatus |
| PATCH | `/applications/ramadan-ration/:id/status` | statusUpdateSchema → adminController.updateRamadanRationApplicationStatus |
| PATCH | `/applications/orphan/:id/status` | statusUpdateSchema → adminController.updateOrphanRegistrationStatus |
| GET | `/volunteers/tasks` | adminController.getVolunteerTasks |
| GET | `/volunteers` | adminController.getVolunteers |
| PATCH | `/volunteers/tasks/:id/status` | statusUpdateSchema → adminController.updateVolunteerTaskStatus |

Admin list endpoints include nested `user: { id, email, fullName, phoneNumber }`.

---

## Database Schema (Prisma + MySQL)

Schema file: `server/prisma/schema.prisma`

### Enums

```prisma
enum UserType         { DONOR, BENEFICIARY, VOLUNTEER, ADMIN }
enum QurbaniAnimalType { GOAT, COW, CAMEL }
enum LoanType         { INTEREST_FREE, BUSINESS, EDUCATION, MEDICAL, HOUSING }
enum TaskCategory     { DISTRIBUTION, FUNDRAISING, AWARENESS, ADMINISTRATIVE, FIELD_WORK, EVENT_SUPPORT }
```

Note: `loanApplicationSchema` in the validator also allows `MARRIAGE` and `OTHER` as string values (not in enum — keep in sync if you add them to Prisma).

### Status values (String field, not enum)
All form models use a `status String @default("pending")`:
- Donations: `pending`, `confirmed`, `completed`, `rejected`
- Applications: `pending`, `under_review`, `approved`, `rejected`
- Volunteer tasks: `pending`, `approved`, `rejected`
- Controlled via `statusUpdateSchema`: enum `['pending','approved','rejected','confirmed','completed','under_review']`

### User model
```
id          Int       @id @default(autoincrement())
email       String    @unique
password    String    (bcrypt hash)
fullName    String
phoneNumber String
cnic        String?   @unique
userType    UserType
isActive    Boolean   @default(true)
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt
-- relations: qurbaniDonations[], rationDonations[], skinCollections[],
             orphanSponsorships[], loanApplications[], ramadanRations[],
             orphanRegistrations[], volunteerTasks[]
@@index([email]) @@index([userType])
```

### QurbaniDonation
```
id, userId (FK cascade), animalType QurbaniAnimalType,
quantity Int, totalAmount Decimal(10,2),
donorName, donorPhone, donorAddress Text,
deliveryDate DateTime?, notes Text?,
status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### RationDonation
```
id, userId (FK cascade),
donorName, donorPhone, donorEmail,
amount Decimal(10,2), rationItems Text? (JSON string),
notes Text?, status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### SkinCollection
```
id, userId (FK cascade),
donorName, donorPhone, collectionAddress Text,
numberOfSkins Int, animalType String,
preferredDate DateTime (required),
notes Text?, status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### OrphanSponsorship
```
id, userId (FK cascade),
sponsorName, sponsorPhone, sponsorEmail,
monthlyAmount Decimal(10,2), duration Int (months),
orphanAge String?, orphanGender String?, startDate DateTime?,
notes Text?, status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### LoanApplication
```
id, userId (FK cascade),
loanType LoanType,
requestedAmount Decimal(10,2), monthlyIncome Decimal(10,2),
familyMembers Int, employmentStatus String,
purposeDescription Text,
applicantName, applicantPhone, applicantCNIC (13 digits), applicantAddress Text,
guarantorName?, guarantorPhone?, guarantorCNIC?, guarantorAddress Text?,
additionalNotes Text?,
status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### RamadanRationApplication
```
id, userId (FK cascade),
familyMembers Int, monthlyIncome Decimal(10,2),
hasDisabledMembers Boolean, disabilityDetails Text?,
applicantName, applicantPhone, applicantCNIC, applicantAddress Text,
reasonForApplication Text, previouslyReceived Boolean,
additionalNotes Text?,
status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### OrphanRegistration
```
id, userId (FK cascade),
orphanName, orphanAge Int, orphanGender String,
guardianRelation, guardianName, guardianPhone, guardianCNIC, guardianAddress Text,
monthlyIncome Decimal(10,2), familyMembers Int,
educationLevel, schoolName?,
healthCondition Text?,
fatherStatus String (DECEASED/UNKNOWN/ABSENT),
motherStatus String (DECEASED/ALIVE/UNKNOWN/ABSENT),
additionalNotes Text?,
status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status])
```

### VolunteerTask
```
id, userId (FK cascade),
volunteerName, volunteerPhone, volunteerEmail, volunteerAddress Text,
taskCategory TaskCategory,
availability String (JSON array of days e.g. ["monday","saturday"]),
skills Text?, experience Text?, preferredLocation?,
emergencyContact String,
status String @default("pending"),
createdAt, updatedAt
@@index([userId]) @@index([status]) @@index([taskCategory])
```

### Session (runtime store — do not modify)
```
id String @id, sid String @unique, data Text, expiresAt DateTime
@@index([expiresAt])
```

### Adding a new form type — checklist
1. Add Prisma model + relation on `User` → `make db-migrate`
2. Create `services/*Service.js` with create + getByUserId functions
3. Create `controllers/*Controller.js` (thin, uses asyncHandler)
4. Create `validators/*Validator.js` (Zod schema)
5. Create `routes/*Routes.js` and mount in `app.js`
6. Add admin get + status-update endpoints to `adminRoutes.js` / `adminController.js` / `adminService.js`
7. Surface counts in `adminService.getDashboardStats()` and `userService.getUserDashboardStats()`
8. Add frontend service functions, page, route in `App.jsx`, sidebar link

---

## Frontend Architecture (`client/src/`)

### Routing (`App.jsx`)

Single source of truth for routes. Every protected route: `<ProtectedRoute>` → `<RoleBasedRoute allowedRoles={[...]}>`.

| Path | Component | Allowed Roles |
|------|-----------|---------------|
| `/login` | Login | public |
| `/signup` | Signup | public |
| `/dashboard/user` | UserDashboard | DONOR, BENEFICIARY, VOLUNTEER |
| `/dashboard/user/qurbani` | QurbaniDonation | DONOR |
| `/dashboard/user/ration` | RationDonation | DONOR |
| `/dashboard/user/skin-collection` | SkinCollection | DONOR |
| `/dashboard/user/orphan-sponsorship` | OrphanSponsorship | DONOR |
| `/dashboard/user/loan` | LoanApplication | BENEFICIARY |
| `/dashboard/user/ramadan-ration` | RamadanRationApplication | BENEFICIARY |
| `/dashboard/user/orphan` | OrphanRegistration | BENEFICIARY |
| `/dashboard/user/volunteer-task` | VolunteerTaskRegistration | VOLUNTEER |
| `/dashboard/admin` | AdminDashboard | ADMIN |
| `/dashboard/admin/users` | UserManagement | ADMIN |
| `/dashboard/admin/donations` | DonationsManagement | ADMIN |
| `/dashboard/admin/applications` | ApplicationsManagement | ADMIN |
| `/dashboard/admin/volunteers` | VolunteersManagement | ADMIN |
| `/dashboard/admin/create-admin` | CreateAdmin | ADMIN |
| `*` | 404 page | — |

Root `/` redirects to `/login`.

### Auth guards
- `ProtectedRoute` — calls `checkAuth()` on mount, shows `LoadingSpinner` while `loading === true`, redirects to `/login` if not authenticated. **Do not change `loading: true` default in authStore without auditing this.**
- `RoleBasedRoute` — checks `user.userType` against `allowedRoles`; ADMIN goes to `/dashboard/admin`, others to `/dashboard/user`.

### Auth store (`store/authStore.js`) — Zustand

```js
state:   { user, loading: true, error, isAuthenticated: false }
actions: login(email, password), signup(userData), logout(), checkAuth(), clearError()
```

`checkAuth()` hits `GET /auth/me` on every page load to validate existing session.

### Services (`services/`)

One file per backend resource. All import the shared `api.js` — **do not create new axios instances**.

- `api.js` — axios with `baseURL = VITE_API_URL || http://localhost:5000/api`, `withCredentials: true`, response interceptor → rejects with `{ message, errors, status }`
- `authService.js` — signup, login, logout, getCurrentUser
- `userService.js` — getDashboardStats, getRecentActivities(limit)
- `donationService.js` — CRUD for qurbani, ration, skinCollection, orphanSponsorship
- `applicationService.js` — CRUD for loan, ramadanRation, orphanRegistration
- `volunteerService.js` — createVolunteerTask, getVolunteerTasks
- `adminService.js` — getDashboardStats, get/updateStatus for all 8 form types, getVolunteers

### Components

```
components/
  auth/
    ProtectedRoute.jsx     — session gate
    RoleBasedRoute.jsx     — role gate
  layout/
    DashboardLayout.jsx    — sidebar + header shell
    Header.jsx             — logo, user badge, logout dropdown
    Sidebar.jsx            — dynamic menu from userType, mobile overlay
  ui/
    Button.jsx             — variants: default/destructive/outline/secondary/ghost/link; sizes: sm/default/lg/icon
    Card.jsx               — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
    Input.jsx              — with focus ring, error state
    Label.jsx              — required (*) indicator
    Alert.jsx              — variants: default/error/success/warning
  admin/
    DataTable.jsx          — columns+data+onStatusUpdate; expandable rows; Approve/Reject for pending items
  common/
    LoadingSpinner.jsx     — sizes: sm/md/lg
  animations/
    FadeIn.jsx             — direction (up/down/left/right/none), delay, duration
  decorative/
    BackgroundBlobs.jsx    — variants: default/vibrant
    DotPattern.jsx         — SVG dot overlay
  illustrations/
    CharacterLaptop.jsx, CharacterProfessional.jsx, CharacterWave.jsx, CharacterGroup.jsx
```

### Pages

```
pages/
  auth/         Login.jsx, Signup.jsx
  dashboard/    UserDashboard.jsx, AdminDashboard.jsx
  donor/        QurbaniDonation.jsx, RationDonation.jsx, SkinCollection.jsx, OrphanSponsorship.jsx
  beneficiary/  LoanApplication.jsx, RamadanRationApplication.jsx, OrphanRegistration.jsx
  volunteer/    VolunteerTaskRegistration.jsx
  admin/        UserManagement.jsx, DonationsManagement.jsx, ApplicationsManagement.jsx,
                VolunteersManagement.jsx, CreateAdmin.jsx
```

### Form pattern (all form pages)

```jsx
const schema = z.object({ field: z.string().min(2), amount: z.coerce.number().positive() })
const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(schema) })
const onSubmit = async (data) => {
  try {
    await someService.create(data)
    toast.success('Title', { description: '...' })
    reset()
  } catch (err) {
    toast.error('Title', { description: err.message })
  }
}
```

Toast notifications: `sonner` library, positioned top-right with `richColors`. Inline field errors displayed as `<p className="text-error">{errors.field.message}</p>`.

### Utilities (`lib/utils.js`)

```js
cn(...inputs)           // clsx + twMerge
formatCurrency(amount)  // → "PKR 1,000"
formatDate(date)        // → "January 1, 2025"
getStatusColor(status)  // → Tailwind class string for badge
```

Status badge colors: pending=warning, approved/completed=success, rejected=error, confirmed/under_review=info.

### Tailwind (`tailwind.config.js`)

Custom colors: `primary-{50..950}` (blue scale), `success/warning/error/info` each with default/light/dark.
Custom shadows: `soft`, `medium`, `large`, `glow-blue`, `glow-blue-strong`, `inner-subtle`.
Custom animations: `fade-in`, `fade-in-up/down/left/right`, `float` (3s infinite), `pulse-slow`, `scale-in`.
Font: Inter.

---

## Key Patterns & Conventions

1. **Service layer owns all Prisma** — controllers never import Prisma directly.
2. **Error propagation** — throw `ApiError` in services; controller wraps with `asyncHandler`; global handler formats response.
3. **Role guard in routes** — never inside controllers; composed in the route file with `router.use(requireAuth)` then per-endpoint `requireRole(...)`.
4. **Validation in middleware** — `validateRequest(schema)` replaces `req.body`; controllers get clean typed data.
5. **All list endpoints for admin include user** — `include: { user: { select: { id, email, fullName, phoneNumber } } }`.
6. **CNIC uniqueness** — used as a secondary unique identifier alongside email; 13 digits (no dashes in DB checks).
7. **Date fields** — passed as strings from client, parsed in service before Prisma insert.
8. **Availability field** — stored as JSON string in VolunteerTask; stringify before create, parse on display.
9. **One axios instance** — `client/src/services/api.js`; do not create additional instances.
10. **Zustand `loading: true` default** — ProtectedRoute depends on this; `checkAuth()` sets it false after resolving.
