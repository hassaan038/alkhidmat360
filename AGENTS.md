# AGENTS.md

Quick-reference cheat sheet for AI agents working on this repo. Read CLAUDE.md for full context; this file is dense reference material.

## Stack at a glance

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 4.5, Tailwind 3.4, React Router 6, Zustand 5, react-hook-form 7, Zod 4, Axios, Sonner |
| Backend | Node 18, Express 4, Prisma 6 (ESM modules), Zod 3, bcryptjs, express-session + express-mysql-session |
| DB | MySQL 8 (local :3306, Docker :3307) |
| Monorepo | npm workspaces: `client/`, `server/` |

---

## File map

```
server/src/
  app.js                      — Express setup, CORS, sessions, route mounting
  server.js                   — dotenv + listen
  routes/
    authRoutes.js             — /api/auth
    donationRoutes.js         — /api/donations
    applicationRoutes.js      — /api/applications
    volunteerRoutes.js        — /api/volunteers
    adminRoutes.js            — /api/admin
    userRoutes.js             — /api/users
  controllers/
    authController.js
    donationController.js
    applicationController.js
    volunteerController.js
    adminController.js
    userController.js
  services/
    authService.js
    donationService.js
    applicationService.js
    volunteerService.js
    adminService.js
    userService.js
  validators/
    authValidator.js          — signupSchema, loginSchema
    donationValidator.js      — qurbaniDonationSchema, rationDonationSchema, skinCollectionSchema, orphanSponsorshipSchema
    applicationValidator.js   — loanApplicationSchema, ramadanRationSchema, orphanRegistrationSchema
    volunteerValidator.js     — volunteerTaskSchema
    adminValidator.js         — statusUpdateSchema, createAdminSchema
  middleware/
    authMiddleware.js         — requireAuth, requireRole, requireAdmin
    validationMiddleware.js   — validateRequest(zodSchema)
  utils/
    asyncHandler.js           — asyncHandler(fn)
    ApiResponse.js            — ApiResponse class + ApiError class
server/prisma/
  schema.prisma
  seed.js                     — upserts 4 test users (safe to re-run)

client/src/
  App.jsx                     — all routes
  store/authStore.js          — Zustand: user, loading, isAuthenticated, error
  services/
    api.js                    — shared axios instance (withCredentials: true)
    authService.js
    userService.js
    donationService.js
    applicationService.js
    volunteerService.js
    adminService.js
  components/
    auth/ProtectedRoute.jsx, RoleBasedRoute.jsx
    layout/DashboardLayout.jsx, Header.jsx, Sidebar.jsx
    ui/Button.jsx, Card.jsx, Input.jsx, Label.jsx, Alert.jsx
    admin/DataTable.jsx
    common/LoadingSpinner.jsx
    animations/FadeIn.jsx
    decorative/BackgroundBlobs.jsx, DotPattern.jsx
    illustrations/Character*.jsx
  pages/
    auth/Login.jsx, Signup.jsx
    dashboard/UserDashboard.jsx, AdminDashboard.jsx
    donor/QurbaniDonation.jsx, RationDonation.jsx, SkinCollection.jsx, OrphanSponsorship.jsx
    beneficiary/LoanApplication.jsx, RamadanRationApplication.jsx, OrphanRegistration.jsx
    volunteer/VolunteerTaskRegistration.jsx
    admin/UserManagement.jsx, DonationsManagement.jsx, ApplicationsManagement.jsx,
          VolunteersManagement.jsx, CreateAdmin.jsx
  lib/utils.js                — cn(), formatCurrency(), formatDate(), getStatusColor()
```

---

## Domain model

```
UserType enum: DONOR | BENEFICIARY | VOLUNTEER | ADMIN

DONOR       → QurbaniDonation, RationDonation, SkinCollection, OrphanSponsorship
BENEFICIARY → LoanApplication, RamadanRationApplication, OrphanRegistration
VOLUNTEER   → VolunteerTask
ADMIN       → management-only; no owned forms; accesses all via /api/admin/*
```

---

## Prisma models summary

All non-User models share: `id (PK autoincrement)`, `userId (FK cascade delete)`, `status String @default("pending")`, `createdAt`, `updatedAt`, `@@index([userId])`, `@@index([status])`.

| Model | Notable fields |
|-------|----------------|
| User | email (unique), cnic (unique, optional), userType enum, isActive Boolean |
| QurbaniDonation | animalType enum (GOAT/COW/CAMEL), quantity Int, totalAmount Decimal(10,2), deliveryDate DateTime? |
| RationDonation | amount Decimal(10,2), rationItems Text? (stored as JSON string) |
| SkinCollection | numberOfSkins Int, animalType String, preferredDate DateTime (required) |
| OrphanSponsorship | monthlyAmount Decimal(10,2), duration Int (months), orphanAge/Gender String? |
| LoanApplication | loanType enum, requestedAmount Decimal, guarantor fields all optional |
| RamadanRationApplication | hasDisabledMembers Boolean, previouslyReceived Boolean |
| OrphanRegistration | orphanAge Int (0–18), fatherStatus/motherStatus Strings (fixed values) |
| VolunteerTask | taskCategory enum, availability String (JSON array e.g. ["monday","saturday"]) |
| Session | runtime store only — do not interact with via Prisma |

### Prisma enums
```
UserType:         DONOR, BENEFICIARY, VOLUNTEER, ADMIN
QurbaniAnimalType: GOAT, COW, CAMEL
LoanType:         INTEREST_FREE, BUSINESS, EDUCATION, MEDICAL, HOUSING
TaskCategory:     DISTRIBUTION, FUNDRAISING, AWARENESS, ADMINISTRATIVE, FIELD_WORK, EVENT_SUPPORT
```

---

## Status values

| Category | Valid statuses |
|----------|----------------|
| Donations | pending, confirmed, completed, rejected |
| Applications | pending, under_review, approved, rejected |
| Volunteer tasks | pending, approved, rejected |
| statusUpdateSchema | pending, approved, rejected, confirmed, completed, under_review |

---

## API endpoints reference

### /api/auth (public)
```
POST /signup       signupSchema → authController.signup
POST /login        loginSchema  → authController.login
POST /logout       requireAuth  → authController.logout
GET  /me           requireAuth  → authController.getCurrentUser
```

### /api/donations (requireAuth + requireRole('DONOR'))
```
POST /qurbani             qurbaniDonationSchema  → create
GET  /qurbani                                    → list (current user)
POST /ration              rationDonationSchema   → create
GET  /ration                                     → list
POST /skin-collection     skinCollectionSchema   → create
GET  /skin-collection                            → list
POST /orphan-sponsorship  orphanSponsorshipSchema → create
GET  /orphan-sponsorship                         → list
```

### /api/applications (requireAuth + requireRole('BENEFICIARY'))
```
POST /loan              loanApplicationSchema   → create
GET  /loan                                      → list
POST /ramadan-ration    ramadanRationSchema     → create
GET  /ramadan-ration                            → list
POST /orphan            orphanRegistrationSchema → create
GET  /orphan                                    → list
```

### /api/volunteers (requireAuth + requireRole('VOLUNTEER'))
```
POST /task  volunteerTaskSchema → create
GET  /task                      → list
```

### /api/users (requireAuth, user-type filtered)
```
GET /dashboard/stats
GET /dashboard/activities?limit=10
```

### /api/admin (requireAuth + requireRole('ADMIN'))
```
GET  /stats
POST /create-admin                              createAdminSchema

GET  /donations/qurbani                         → all with user: {id,email,fullName,phoneNumber}
GET  /donations/ration
GET  /donations/skin-collection
GET  /donations/orphan-sponsorship
PATCH /donations/qurbani/:id/status             statusUpdateSchema
PATCH /donations/ration/:id/status
PATCH /donations/skin-collection/:id/status
PATCH /donations/orphan-sponsorship/:id/status

GET  /applications/loan
GET  /applications/ramadan-ration
GET  /applications/orphan
PATCH /applications/loan/:id/status
PATCH /applications/ramadan-ration/:id/status
PATCH /applications/orphan/:id/status

GET  /volunteers/tasks
GET  /volunteers                                → users with userType=VOLUNTEER
PATCH /volunteers/tasks/:id/status
```

---

## Zod validator field reference

### signupSchema
`email, password (min 6), fullName (min 2), phoneNumber (min 10), cnic? (string), userType enum([DONOR,BENEFICIARY,VOLUNTEER])`

### loginSchema
`email, password (min 1)`

### qurbaniDonationSchema
`animalType enum([GOAT,COW,CAMEL]), quantity (int ≥1), totalAmount (positive), donorName (min 2), donorPhone (min 10), donorAddress (min 10), deliveryDate? (string), notes?`

### rationDonationSchema
`donorName (min 2), donorPhone (min 10), donorEmail (email), amount (positive), rationItems? (string), notes?`

### skinCollectionSchema
`donorName (min 2), donorPhone (min 10), collectionAddress (min 10), numberOfSkins (int ≥1), animalType (min 2), preferredDate (required string), notes?`

### orphanSponsorshipSchema
`sponsorName (min 2), sponsorPhone (min 10), sponsorEmail (email), monthlyAmount (positive), duration (int ≥1), orphanAge?, orphanGender?, startDate?, notes?`

### loanApplicationSchema
`loanType enum([BUSINESS,EDUCATION,MEDICAL,HOUSING,MARRIAGE,OTHER]), requestedAmount (positive), monthlyIncome (≥0), familyMembers (int ≥1), employmentStatus (2–50), purposeDescription (min 10), applicantName (min 2), applicantPhone (11–15), applicantCNIC (exactly 13 digits), applicantAddress (min 10), guarantorName? (min 2 or empty), guarantorPhone? (11–15 or empty), guarantorCNIC? (13 or empty), guarantorAddress? (min 10 or empty), additionalNotes?`

### ramadanRationSchema
`familyMembers (int ≥1), monthlyIncome (≥0), hasDisabledMembers (boolean), disabilityDetails? (string), applicantName (min 2), applicantPhone (11–15), applicantCNIC (exactly 13), applicantAddress (min 10), reasonForApplication (min 10), previouslyReceived (boolean), additionalNotes?`

### orphanRegistrationSchema
`orphanName (min 2), orphanAge (int 0–18), orphanGender enum([MALE,FEMALE]), guardianRelation (2–50), guardianName (min 2), guardianPhone (11–15), guardianCNIC (exactly 13), guardianAddress (min 10), monthlyIncome (≥0), familyMembers (int ≥1), educationLevel (2–50), schoolName? (min 2), healthCondition?, fatherStatus enum([DECEASED,UNKNOWN,ABSENT]), motherStatus enum([DECEASED,ALIVE,UNKNOWN,ABSENT]), additionalNotes?`

### volunteerTaskSchema
`volunteerName (min 2), volunteerPhone (11–15), volunteerEmail (email), volunteerAddress (min 10), taskCategory enum([DISTRIBUTION,FUNDRAISING,AWARENESS,ADMINISTRATIVE,FIELD_WORK,EVENT_SUPPORT]), availability (string — JSON array of days), skills?, experience?, preferredLocation?, emergencyContact (11–15)`

### statusUpdateSchema
`status enum([pending,approved,rejected,confirmed,completed,under_review])`

### createAdminSchema
`email, password (min 6), fullName (min 2), phoneNumber (11–15), cnic? (exactly 13)`

---

## Frontend routing

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

---

## Backend — adding new features

### New controller method pattern
```js
export const createThing = asyncHandler(async (req, res) => {
  const result = await thingService.create(req.session.userId, req.body)
  res.status(201).json(new ApiResponse(201, result, 'Created successfully'))
})
```

### New route pattern
```js
router.use(requireAuth)
router.post('/', requireRole('DONOR'), validateRequest(thingSchema), controller.createThing)
router.get('/', requireRole('DONOR'), controller.getThings)
```

### New form type checklist
1. Add Prisma model (userId FK cascade, status default pending, createdAt, updatedAt, indexes on userId+status)
2. Add relation array on User model
3. `make db-migrate`
4. Create `services/`, `controllers/`, `validators/`, `routes/` files
5. Mount route in `app.js`
6. Add admin GET + PATCH status endpoints in adminRoutes/Controller/Service
7. Add counts to `adminService.getDashboardStats()` + `userService.getUserDashboardStats()`

---

## Frontend — adding new features

### New form page pattern
```jsx
const schema = z.object({ field: z.string().min(2) })
const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(schema) })
const onSubmit = async (data) => {
  try {
    await service.create(data)
    toast.success('Done!', { description: 'Submitted.' })
    reset()
  } catch (err) {
    toast.error('Failed', { description: err.message })
  }
}
```

### New service function
```js
import api from './api'
export const thingService = {
  create: (data) => api.post('/things', data).then(r => r.data),
  getAll: () => api.get('/things').then(r => r.data),
}
```

### Adding a route
In `App.jsx`, follow existing nested pattern:
```jsx
<Route path="/dashboard/user/new-thing" element={
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={['DONOR']}>
      <NewThingPage />
    </RoleBasedRoute>
  </ProtectedRoute>
} />
```

---

## Common gotchas

| Issue | Fix |
|-------|-----|
| 401 on protected routes | Client needs `withCredentials: true`; CORS must not use `*` |
| ProtectedRoute flashes redirect | Don't change `loading: true` default in authStore; checkAuth resolves it |
| Prisma Session vs runtime store | MySQLStore manages `sessions` table directly — don't query it via Prisma |
| Date insert fails | Parse string in service: `new Date(dateString)` |
| availability field wrong type | `JSON.stringify(days[])` before submit; parse on display |
| Admin list missing user info | Add `include: { user: { select: { id, email, fullName, phoneNumber } } }` |
| Multiple axios instances | Only use `import api from './api'` in services — never call `axios.create()` |
| CNIC validation fails | Pass exactly 13 digits with no dashes |

---

## Environment variables

| Variable | Where | Notes |
|----------|-------|-------|
| DATABASE_URL | server | `mysql://user:pass@host:port/db`; app.js URL-decodes the password |
| PORT | server | Default 5000 |
| NODE_ENV | server | `production` enables secure cookies |
| SESSION_SECRET | server | Required |
| SESSION_NAME | server | Default `alkhidmat_sid` |
| CORS_ORIGIN | server | Must exactly match client origin |
| VITE_API_URL | client | Default `http://localhost:5000/api` |

---

## Test credentials

```
admin@alkhidmat360.com   / admin123
donor@test.com           / donor123
beneficiary@test.com     / beneficiary123
volunteer@test.com       / volunteer123
```

---

## Coding conventions

- ES modules throughout (`import/export`, `"type": "module"` in package.json)
- 2-space indent, single quotes, no semicolons (server); Prettier/ESLint defaults (client)
- React components: `PascalCase.jsx`; everything else: `camelCase.js`
- No comments unless the WHY is non-obvious
- No test suite — lint with `cd client && npm run lint` before committing
- Commit style: Conventional Commits (`feat:`, `fix:`, `refactor:`)
