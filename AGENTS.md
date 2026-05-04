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


<claude-mem-context>
# Memory Context

# [alkhidmat360] recent context, 2026-04-21 8:52pm GMT+5

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (21,075t read) | 1,921,316t work | 99% savings

### Apr 19, 2026
9 1:03a 🟣 alkhidmat360 Tailwind Config Expanded with Per-Module Accent Palette
10 " 🟣 New Shared UI Primitives: PageContainer, PageHeader, StatCard
14 1:06a 🟣 Additional UI Primitives Completed: FormSection, IconTile, Badge, SectionHeading, Skeleton
15 " 🔄 Button.jsx and Input.jsx Significantly Enhanced
16 " 🔄 DataTable.jsx Completely Rebuilt with Search, Filters, Skeleton, and StatusBadge
17 " 🔄 Header.jsx and Sidebar.jsx: Accessibility + Cursor Sweep (Task 4 Completed)
18 " 🔄 UserDashboard Quick Actions: Emoji Replaced with IconTile + Lucide + Module Tones
27 1:14a 🟣 Phase 2 Task Created: Auth Pages + Shell Redesign
28 " 🟣 Phase 3 Task Created: UserDashboard + AdminDashboard Redesign
29 " 🟣 Phase 4 Task Created: 13 Form Pages Full Redesign
33 " 🟣 Phases 5–7 Tasks Created: Admin Tables, Module Flows, Settings Polish
34 " 🔵 Auth Pages Already Have Split-Screen Layout Pre-Phase 2
35 " ⚖️ Incremental Per-Phase Git Commits Policy Saved to Project Memory
36 1:17a 🔄 Login.jsx Redesigned: Branded Side Panel Replaces Hero Image Layout
37 " 🔄 Signup.jsx Redesigned: Tone-Based Role Picker and Branded Side Panel
38 " 🔄 Header.jsx Redesigned: roleMeta Lookup Table, Initials Avatar, Role Chip Badge
39 " 🔄 Sidebar.jsx Redesigned: Grouped Sections, toneAccent Active Indicators, HelpCircle Footer
40 " 🔴 Lint Failure: Unused Icon Variable in Login and Signup Feature Bullet Maps
46 1:18a 🔴 Lint Fix: Unused Icon Variable Resolved via feat.icon Pattern in Auth Pages
47 " ✅ Phase 2 UI Redesign Committed to Git — commit 990529f
48 " 🔵 AdminDashboard Already Has Charts, StatCards, Pending Reviews — Phase 3 Is Enhancement
49 " 🔄 DonationsBarChart Upgraded to Per-Bar Multi-Color Palette
64 1:54a ⚖️ Phase 4+ UI Expansion — Dark Mode, Navbar Overhaul, Auth Logo Restore, Sidebar Settings Removal
65 " 🔄 Sidebar Settings Link Removed — Consolidated to Header User Menu Only
67 1:55a 🔄 Header.jsx Overhauled — Search Bar with ⌘K Shortcut, Mobile Search Button, Platform Detection
72 1:57a 🟣 Alkhidmat Hero Image Restored on Login and Signup Panels with Floating Glass Frame
73 " 🔴 ESLint `react-hooks/set-state-in-effect` Lint Error in Header useIsMac Hook — Suppression Attempted
74 " 🟣 Modal.jsx UI Component Created — Accessible Dialog Shell with Portal, Escape, Focus Trap
75 " ✅ Git Commit `becf393` — Header Search, Sidebar Settings Removal, Auth Hero Image (Phase 4+)
76 2:00a 🔄 PaymentScreenshotPicker Redesigned — useId, Replace Affordance, Glassmorphism Preview Card
77 " 🔄 MyHissaBookings Payment Dialog Migrated to Shared Modal Component
78 " 🟣 Dark Mode Infrastructure Implemented — Tailwind Class Strategy, Zustand Store, Anti-FOUC Script
83 2:01a 🔄 Dark Mode Token Sweep — Badge, IconTile, PageHeader, StatCard, FormSection, SectionHeading
87 2:10a 🔵 Dark Mode Classes Verified Across Layout Components and Index Styles
88 " 🔵 Malformed Class Joins Audit Passed — No Missing Whitespace in Dark Mode Classes
89 2:11a 🔵 Dark Mode Styles Compiled into Production Build with Proper CSS Selectors
91 " 🔵 Dark Mode CSS Uses :is() Selector Wrapping with CSS Variables for Opacity Modulation
92 2:13a 🔵 Dark Mode Implementation Verified Live — Dev Server Starts with Anti-FOUC Script Active
93 2:15a ✅ themeStore.js Enhanced with SSR Safety and Theme Initialization
94 " ✅ Dark Mode Rebuild Verified and Theme Initialization Hardening Committed
### Apr 21, 2026
302 8:30p ⚖️ Al-Khidmat 360 SRS/Design Report Completion Task Initiated
303 " 🔵 Al-Khidmat 360 Codebase Structure Fully Mapped for Report Completion
304 " 🔵 Al-Khidmat 360 Prisma Schema Reveals Modules Added After Original SRDS
305 " 🔵 Complete Route Map and Missing Report Chapters Identified for Al-Khidmat 360 SRDS
306 8:32p 🔵 Google Chrome Headless Confirmed as Screenshot Strategy for SRDS Report
307 " 🔵 Complete Tech Stack Verified from package.json for Report Development and Tools Chapter
308 " 🔵 Full API Surface and Validation Rules Catalogued for Use Case and Test Case Generation
309 8:35p 🟣 SRDS Completion Chapters Written to reports/alkhidmat-360-completion-chapters.md
310 " 🟣 PDF of Completion Chapters Generated via Node.js HTML Converter + Chrome Headless
311 8:36p 🟣 Complete 67-Page Al-Khidmat 360 SRDS Report Assembled and Verified

Access 1921k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>