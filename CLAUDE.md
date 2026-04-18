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
GET  /uploads/*            → express.static(server/uploads)  (qurbani photos)
POST /api/auth/*           → authRoutes
/api/donations/*           → donationRoutes
/api/applications/*        → applicationRoutes
/api/volunteers/*          → volunteerRoutes
/api/admin/*               → adminRoutes
/api/users/*               → userRoutes
/api/qurbani-module/*      → qurbaniModuleRoutes  (seasonal, flag-gated)
/api/config/*              → configRoutes         (system flags + bank details)

404 handler → { success: false, message: 'Route not found' }
Global error handler → { success: false, message, errors?, stack? (dev only) }
  — propagates ApiError.errors[] (Zod validation field errors) to the client
```

### Sessions (critical)

Auth is **session-cookie**, not JWT. Login stores `req.session.userId` (Int) and `req.session.user` (object with `userType`). Both are read by middleware — always set both.

`express-mysql-session` auto-creates the `sessions` table at boot. The Prisma `Session` model is mapped to that real table via `@@map("sessions")` (columns `session_id`, `expires`, `data`) so `prisma migrate dev` no longer detects drift. Prisma never writes to it — runtime store is sole owner. Migration `20260418150000_align_sessions_with_runtime` dropped the unused PascalCase `Session` table from the init migration and registered the runtime table idempotently.

The client sends `withCredentials: true`; CORS must stay `credentials: true` with a specific origin (never wildcard).

Cookie name: `alkhidmat_sid` (from SESSION_NAME env). Logout calls `req.session.destroy()` and clears this cookie.

### Auth middleware (`middleware/authMiddleware.js`)

| Function | Checks | Throws |
|----------|--------|--------|
| `requireAuth` | `req.session.userId` exists | 401 |
| `requireRole(...roles)` | `req.session.user.userType` in allowedRoles | 403 |
| `requireAdmin` | `req.session.user.userType === 'ADMIN'` | 403 |

Validation middleware: `validateRequest(zodSchema)` (in `middleware/validationMiddleware.js`).

Module-gating middleware: `requireQurbaniModuleActive` (in `middleware/qurbaniModuleMiddleware.js`) — reads SystemConfig key `qurbani_module_enabled`, throws 403 unless `'true'` (admins bypass).

File upload middleware (in `middleware/uploadMiddleware.js`):
- `uploadQurbaniPhoto` — multer disk storage at `server/uploads/qurbani/`, image-only, 5 MB cap. Use as `.single('photo')`.
- `uploadSkinPickupPhoto` — multer disk storage at `server/uploads/skin-pickup/`, image-only, 5 MB cap. Use as `.single('housePhoto')`.
- `uploadPaymentScreenshot` — multer disk storage at `server/uploads/payments/`, image-only, 5 MB cap. Use as `.single('paymentScreenshot')`. Used by qurbani booking POST, qurbani mark-paid POST, and fitrana POST so users can optionally attach proof of bank transfer.

All must run BEFORE `validateRequest` so Zod sees text fields. Validators must use `z.coerce.number()` for numeric multipart fields, and `z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true)` for boolean fields like `paymentMarked` (multipart sends "true"/"false" as strings).

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

### `/api/qurbani-module` (requireAuth + requireQurbaniModuleActive — any authenticated user)
| Method | Path | Handler |
|--------|------|---------|
| GET | `/listings` | qurbaniModuleController.getActiveListings (only ACTIVE; includes hissasBooked, hissasAvailable) |
| GET | `/listings/:id` | qurbaniModuleController.getListingDetail |
| POST | `/bookings` | createBookingSchema → qurbaniModuleController.createBooking (transactional, 409 on overflow) |
| POST | `/bookings/:id/mark-paid` | qurbaniModuleController.markBookingPaid |
| GET | `/bookings/me` | qurbaniModuleController.getMyBookings (includes nested listing) |

### `/api/qurbani-skin-pickup` (requireAuth + requireQurbaniModuleActive — any authenticated user)
| Method | Path | Handler |
|--------|------|---------|
| POST | `/` | uploadSkinPickupPhoto.single('housePhoto') → createSkinPickupSchema → qurbaniSkinPickupController.createPickup (multipart; photo optional, address conditionally required when no GPS coords) |
| GET | `/me` | qurbaniSkinPickupController.getMyPickups |

### `/api/fitrana` (requireAuth + requireQurbaniModuleActive — any authenticated user)
| Method | Path | Handler |
|--------|------|---------|
| POST | `/` | createFitranaSchema → fitranaController.createFitrana (accepts paymentMarked: true to record + flag in one shot) |
| GET | `/me` | fitranaController.getMyFitranas |

### `/api/config` (requireAuth)
| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/qurbani-module` | requireAuth | systemConfigController.getQurbaniModuleFlag → `{ enabled: boolean }` |
| PATCH | `/qurbani-module` | + requireRole('ADMIN') | moduleToggleSchema → systemConfigController.updateQurbaniModuleFlag |
| GET | `/bank-details` | requireAuth | systemConfigController.getBankDetails → `{ bankDetails: string }` |
| PATCH | `/bank-details` | + requireRole('ADMIN') | bankDetailsSchema → systemConfigController.updateBankDetails |

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
| GET | `/qurbani-listings` | qurbaniModuleController.adminListListings (with computed booked/available) |
| POST | `/qurbani-listings` | uploadQurbaniPhoto.single('photo') → createListingSchema → qurbaniModuleController.adminCreateListing (multipart; auto-names "Bull #N" if name omitted) |
| PATCH | `/qurbani-listings/:id` | uploadQurbaniPhoto.single('photo') → updateListingSchema → qurbaniModuleController.adminUpdateListing |
| DELETE | `/qurbani-listings/:id` | qurbaniModuleController.adminDeleteListing (409 if listing has bookings) |
| PATCH | `/qurbani-listings/:id/status` | listingStatusUpdateSchema → qurbaniModuleController.adminUpdateListingStatus (DRAFT↔ACTIVE, ACTIVE→FULL/CLOSED, FULL→CLOSED) |
| GET | `/qurbani-bookings` | qurbaniModuleController.adminListBookings (includes user + listing) |
| PATCH | `/qurbani-bookings/:id/status` | bookingStatusUpdateSchema → qurbaniModuleController.adminUpdateBookingStatus (pending\|confirmed\|rejected) |
| GET | `/qurbani-skin-pickups` | qurbaniSkinPickupController.adminListPickups (includes user) |
| PATCH | `/qurbani-skin-pickups/:id/status` | skinPickupStatusUpdateSchema → qurbaniSkinPickupController.adminUpdatePickupStatus (pending\|scheduled\|collected\|cancelled) |
| GET | `/fitrana` | fitranaController.adminListFitranas (includes user) |
| PATCH | `/fitrana/:id/status` | fitranaStatusUpdateSchema → fitranaController.adminUpdateFitranaStatus (pending\|confirmed\|rejected) |

Admin list endpoints include nested `user: { id, email, fullName, phoneNumber }`.

---

## Database Schema (Prisma + MySQL)

Schema file: `server/prisma/schema.prisma`

### Enums

```prisma
enum UserType            { DONOR, BENEFICIARY, VOLUNTEER, ADMIN }
enum QurbaniAnimalType   { GOAT, COW, CAMEL }
enum LoanType            { INTEREST_FREE, BUSINESS, EDUCATION, MEDICAL, HOUSING }
enum TaskCategory        { DISTRIBUTION, FUNDRAISING, AWARENESS, ADMINISTRATIVE, FIELD_WORK, EVENT_SUPPORT }
enum QurbaniListingStatus { DRAFT, ACTIVE, FULL, CLOSED }
```

Note: `loanApplicationSchema` in the validator also allows `MARRIAGE` and `OTHER` as string values (not in enum — keep in sync if you add them to Prisma).

Note: `qurbaniDonationSchema` (the flat donation form) restricts `animalType` to `['GOAT', 'CAMEL']` only — `COW` is intentionally rejected at the validator level so all bull-share donations go through the new Qurbani module instead. The Prisma enum still includes COW for legacy data and the new module's listings.

### Status values (String field, not enum)
All form models use a `status String @default("pending")`:
- Donations: `pending`, `confirmed`, `completed`, `rejected`
- Applications: `pending`, `under_review`, `approved`, `rejected`
- Volunteer tasks: `pending`, `approved`, `rejected`
- Qurbani hissa bookings: `pending`, `confirmed`, `rejected` (controlled via `bookingStatusUpdateSchema`)
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
             orphanRegistrations[], volunteerTasks[], qurbaniHissaBookings[]
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

### SystemConfig (key-value flag/setting store)
```
id Int, key String @unique, value Text, updatedAt, updatedBy Int?
```
Used keys: `qurbani_module_enabled` ("true"/"false"), `qurbani_bank_details` (free text shown on PaymentPanel).

### QurbaniListing (admin-managed bull listings — seasonal)
```
id, name?, weightKg Decimal?,
totalHissas Int @default(7),
pricePerHissa Decimal,
photoUrl? (path served from /uploads/qurbani/<filename>),
pickupDate DateTime, pickupLocation Text,
description? Text,
status QurbaniListingStatus @default(DRAFT),
createdAt, updatedAt
@@index([status])
```
- Service auto-names "Bull #N" (count+1) on create when `name` is omitted.
- Admin form sends ESTIMATED bull price; client divides by 7 to compute pricePerHissa.
- Status transitions enforced by `updateListingStatus`: DRAFT↔ACTIVE, ACTIVE→FULL/CLOSED, FULL→CLOSED.
- Auto-flips DRAFT→FULL via service when bookings fill the listing.

### QurbaniHissaBooking (per-user hissa booking against a listing)
```
id, listingId (FK cascade), userId (FK cascade),
hissaCount Int, dedications Text (JSON; currently always '[]'),
totalAmount Decimal,
paymentMarked Bool @default(false), paymentMarkedAt DateTime?,
notes? Text,
status String @default("pending"),  // pending, confirmed, rejected
createdAt, updatedAt
@@index([listingId]) @@index([userId]) @@index([status])
```
- `createBooking` runs in `prisma.$transaction` with `Prisma.TransactionIsolationLevel.Serializable`. Aggregates pending+confirmed `hissaCount`, rejects with 409 "Not enough hissas available" if overflow, auto-flips listing to FULL on capacity. P2034/serialization aborts surface as 409 "Booking conflict — please try again".
- `createBookingSchema` accepts an optional `paymentMarked: boolean` (default false). The user-facing flow only writes the booking when the user clicks "I've Paid" in the modal — at that point the client posts `paymentMarked: true` so the slot is locked + flagged in a single transaction. Cancel/close at any point before that means **no DB write at all**.
- Optional `paymentScreenshotUrl` captured on both POST `/bookings` (when paying inline) and POST `/bookings/:id/mark-paid` (when paying for a previously-created pending booking). Multipart field name is always `paymentScreenshot`. Stored under `/uploads/payments/<file>`.
- Service helper `parseDedications` converts the stored JSON string back to an array on every read path so the client always gets a real array.
- The `dedications` feature is currently disabled in the UI (always stored as `'[]'`) — column kept for backwards-compatibility with prior bookings.

### QurbaniSkinPickup (free pickup of qurbani animal skin — gated by same flag)
```
id, userId (FK cascade),
contactPhone, address Text,
latitude Decimal(10,7)?, longitude Decimal(10,7)?,
numberOfSkins Int @default(1),
preferredDate DateTime?,
additionalDetails? Text,
housePhotoUrl? String,  // /uploads/skin-pickup/<file> — optional, captured via mobile camera
status String @default("pending"),  // pending, scheduled, collected, cancelled
createdAt, updatedAt
@@index([userId]) @@index([status])
```
- Distinct from the year-round donor-only `SkinCollection` model. Available to all 3 user types when `qurbani_module_enabled` is true.
- `latitude`/`longitude` populated client-side via `navigator.geolocation` (the "Use My Location" button); both nullable so users can submit address-only requests. Address is conditionally required: enforced via Zod `superRefine` when no coordinates are present.
- Optional `housePhoto` uploaded via multer (`uploadSkinPickupPhoto`) to `server/uploads/skin-pickup/`; field name on multipart body is `housePhoto`. Mobile form uses `<input capture="environment">` for direct camera capture.
- Status transitions free-form via `skinPickupStatusUpdateSchema`. UI rendered through OSM (no API key) — `osmEmbedUrl(lat,lng)` for the iframe preview, `osmLink(lat,lng)` for the "view on map" link.

### Fitrana (Sadaqat al-Fitr — calculated per family member)
```
id, userId (FK cascade),
numberOfPeople Int,
calculationBasis String,        // 'wheat'|'barley'|'dates'|'raisins'|'alkhidmat'|'custom'
amountPerPerson Decimal(10,2),  // rate at submission time (rates change yearly)
totalAmount Decimal(10,2),      // = numberOfPeople * amountPerPerson
contactPhone? String, notes? Text,
paymentMarked Bool @default(false), paymentMarkedAt DateTime?,
status String @default("pending"),  // pending, confirmed, rejected
createdAt, updatedAt
@@index([userId]) @@index([status])
```
- Religious context: traditionally tied to **Eid-ul-Fitr** (end of Ramadan), but currently gated by the same `qurbani_module_enabled` flag as the qurbani booking module (product decision — easy to split onto its own flag later).
- `calculationBasis` is a free string (not a Prisma enum) so adding a new basis later is a code-only change.
- 2026 PKR/person rates baked into the client (`FITRANA_BASES` in `pages/qurbani/Fitrana.jsx`): wheat 300, barley 1100, dates 1600, raisins 3800, alkhidmat 600, custom user-entered. Update annually.
- Same deferred-write payment flow as Qurbani Booking — record only persists when user clicks "I've Paid" in the modal.
- Same optional `paymentScreenshotUrl` mechanism — multipart field `paymentScreenshot`, stored under `/uploads/payments/<file>`.

### Session (mapped to runtime express-mysql-session table — do not write from Prisma)
```
sessionId String @id @map("session_id") @db.VarChar(128)
expires   Int    @db.UnsignedInt
data      String? @db.MediumText
@@map("sessions")
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

### Adding a feature flag (SystemConfig pattern)
1. Pick a stable key (e.g. `feature_x_enabled`), default to `'false'`.
2. Read via `systemConfigService.getConfig(key, 'false')`; write via `setConfig(key, value, userId)`.
3. Expose GET (authed) + PATCH (admin) under `/api/config/<feature>` in `routes/configRoutes.js`.
4. If the flag gates entire routes, write a middleware modeled on `requireQurbaniModuleActive` (admin bypass).
5. Client: add a getter to `services/systemConfigService.js`, fetch once via a Zustand store, conditionally render sidebar links + show "module inactive" empty state on direct navigation.

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
| `/dashboard/user/qurbani-module` | QurbaniModule (listings grid) | DONOR, BENEFICIARY, VOLUNTEER |
| `/dashboard/user/qurbani-bookings` | MyHissaBookings | DONOR, BENEFICIARY, VOLUNTEER |
| `/dashboard/user/qurbani-skin-pickup` | SkinPickup (form + own list, with geolocation) | DONOR, BENEFICIARY, VOLUNTEER |
| `/dashboard/user/fitrana` | Fitrana (calculator + deferred payment modal + own list) | DONOR, BENEFICIARY, VOLUNTEER |
| `/dashboard/admin` | AdminDashboard | ADMIN |
| `/dashboard/admin/users` | UserManagement | ADMIN |
| `/dashboard/admin/donations` | DonationsManagement | ADMIN |
| `/dashboard/admin/applications` | ApplicationsManagement | ADMIN |
| `/dashboard/admin/volunteers` | VolunteersManagement | ADMIN |
| `/dashboard/admin/qurbani-listings` | QurbaniListings (CRUD + photo upload) | ADMIN |
| `/dashboard/admin/qurbani-bookings` | QurbaniBookings (approve/reject) | ADMIN |
| `/dashboard/admin/qurbani-skin-pickups` | QurbaniSkinPickups (status updates) | ADMIN |
| `/dashboard/admin/fitrana` | AdminFitrana (confirm/reject) | ADMIN |
| `/dashboard/admin/qurbani-settings` | QurbaniModuleSettings (toggle + bank details) | ADMIN |
| `/dashboard/admin/create-admin` | CreateAdmin | ADMIN |
| `*` | 404 page | — |

Sidebar conditionally injects qurbani user-side links only when the `qurbani_module_enabled` flag is `true`. Admin always sees the three qurbani admin links so they can prep listings during off-season.

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
- `qurbaniModuleService.js` — listActiveListings, getListing, createBooking, markBookingPaid, getMyBookings + admin: adminListListings, adminCreateListing(FormData), adminUpdateListing(FormData), adminDeleteListing, adminUpdateListingStatus, adminListBookings, adminUpdateBookingStatus
- `systemConfigService.js` — getQurbaniModuleFlag, updateQurbaniModuleFlag(enabled), getBankDetails, updateBankDetails(text)
- `qurbaniSkinPickupService.js` — createSkinPickup, getMySkinPickups + admin: adminListSkinPickups, adminUpdateSkinPickupStatus
- `fitranaService.js` — createFitrana, getMyFitranas + admin: adminListFitranas, adminUpdateFitranaStatus

### Stores (`store/`)
- `authStore.js` — auth state (see Auth store section above)
- `qurbaniModuleStore.js` — `{ moduleEnabled: null|true|false, listings, loading }` + `fetchFlag()`, `refreshFlag()`, `fetchListings()`. `null` initial state lets the sidebar distinguish "still loading" from "flag=false" so qurbani links don't flash in.

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
  qurbani/
    AnimatedBull.jsx              — SVG bull placeholder (uses animate-float) for listings without a photo
    ListingCard.jsx               — photo/AnimatedBull, hissa progress grid, Book CTA
    HissaSelector.jsx             — two-step modal: pick count + notes → payment + screenshot
    PaymentPanel.jsx              — bank details + screenshot picker + "I've Paid" + success state
    PaymentScreenshotPicker.jsx   — reusable file picker w/ live preview, used by all 3 payment surfaces
```

### Pages

```
pages/
  auth/         Login.jsx, Signup.jsx
  dashboard/    UserDashboard.jsx, AdminDashboard.jsx
  donor/        QurbaniDonation.jsx, RationDonation.jsx, SkinCollection.jsx, OrphanSponsorship.jsx
  beneficiary/  LoanApplication.jsx, RamadanRationApplication.jsx, OrphanRegistration.jsx
  volunteer/    VolunteerTaskRegistration.jsx
  qurbani/      QurbaniModule.jsx (listings grid), MyHissaBookings.jsx,
                SkinPickup.jsx (form + own list), Fitrana.jsx (calculator + payment)
  admin/        UserManagement.jsx, DonationsManagement.jsx, ApplicationsManagement.jsx,
                VolunteersManagement.jsx, CreateAdmin.jsx,
                QurbaniListings.jsx, QurbaniBookings.jsx, QurbaniModuleSettings.jsx,
                QurbaniSkinPickups.jsx, AdminFitrana.jsx
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
formatApiError(err)     // → "field: message" for first errors[] entry, else err.message
```

Status badge colors: pending=warning, approved/completed=success, rejected=error, confirmed/under_review=info.

### `lib/imageUrl.js`
`imageUrl(path)` resolves server-relative `/uploads/...` paths to absolute by stripping `/api` from `VITE_API_URL`. Returns `null` for empty input, passes through absolute URLs unchanged. Used by `ListingCard` and admin listing/booking tables for photo thumbnails.

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
11. **Multipart routes** — multer middleware (`uploadQurbaniPhoto.single('photo')`) MUST run before `validateRequest` so the Zod schema sees the body fields. Numeric fields arrive as strings — use `z.coerce.number()` in those validators.
12. **Concurrency-sensitive writes** — Qurbani booking uses `prisma.$transaction` with `Prisma.TransactionIsolationLevel.Serializable` and translates P2034/serialization aborts to 409 so the client retries. Apply the same pattern for any future limited-capacity allocation.
13. **JSON-in-Text fields** — when a column stores JSON as `Text` (`dedications`, `availability`), stringify before insert and parse on every read path at the service layer so controllers/clients see arrays/objects, never raw strings.
