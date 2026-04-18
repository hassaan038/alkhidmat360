# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Alkhidmat 360 — a charity management CRM for donations, beneficiary applications, and volunteer coordination. npm workspaces monorepo with `client/` (React + Vite) and `server/` (Express + Prisma + MySQL).

## Common Commands

Run from the repo root unless noted. The `Makefile` is the primary entry point.

```bash
make setup           # install deps + run prisma migrate deploy + generate
make dev             # concurrently runs server (nodemon) + client (vite)
make db-migrate      # prompts for migration name; runs prisma migrate dev in server/
make db-seed         # node prisma/seed.js
make db-reset        # prisma migrate reset --force (destructive — confirms)
make docker-up       # docker-compose up -d --build (full stack incl. MySQL on :3307)
```

Lint client only: `cd client && npm run lint`. There is no test suite.

Run a single workspace directly:
- Server only: `cd server && npm run dev` (nodemon on `src/server.js`, port 5000)
- Client only: `cd client && npm run dev` (Vite on port 5173)
- Prisma Studio: `cd server && npm run db:studio`

Server requires `server/.env` with `DATABASE_URL`, `SESSION_SECRET`, `SESSION_NAME`, `CORS_ORIGIN`. Docker uses `*.env.docker` files instead.

## Architecture

### Backend layering (server/src/)

Strict route → controller → service → Prisma flow. Do not skip layers.

- `routes/*Routes.js` — wire URL → middleware chain → controller. Auth/role/validation middleware is composed here, not inside controllers.
- `controllers/*Controller.js` — thin; parse `req`, call service, return `ApiResponse`. Wrap async handlers with `asyncHandler` from `utils/asyncHandler.js` so thrown errors reach the global handler in `app.js`.
- `services/*Service.js` — all Prisma access and business logic. Throw `ApiError(status, message)` from `utils/ApiResponse.js` for any user-facing failure; the global error handler in `app.js` formats the response.
- `validators/*Validator.js` — Zod schemas. Apply via `validateRequest(schema)` middleware, which replaces `req.body` with the parsed result.
- `middleware/authMiddleware.js` — `requireAuth` checks `req.session.userId`; `requireRole(...types)` and `requireAdmin` check `req.session.user.userType`. Routes typically `router.use(requireAuth)` then attach `requireRole('DONOR' | 'BENEFICIARY' | 'VOLUNTEER' | 'ADMIN')` per endpoint.

### Sessions (critical)

Auth is session-cookie based, **not JWT**. Sessions are stored in MySQL via `express-mysql-session`, which auto-creates a `sessions` table on boot — this is separate from the Prisma `Session` model in `schema.prisma` (the Prisma model is currently unused by the runtime store). `app.js` parses `DATABASE_URL` to build the store connection; the password is URL-decoded because URL-encoding in the env string is expected.

Login flow stores both `req.session.userId` and `req.session.user` (with `userType`); both are read by middleware, so set both when modifying the auth flow. The client must send credentials — `client/src/services/api.js` sets `withCredentials: true` and CORS in `app.js` sets `credentials: true` with a specific origin (no wildcard).

### Domain model

Four user types (`UserType` enum: DONOR, BENEFICIARY, VOLUNTEER, ADMIN) drive everything. Each non-admin type owns a set of forms:
- DONOR → QurbaniDonation, RationDonation, SkinCollection, OrphanSponsorship
- BENEFICIARY → LoanApplication, RamadanRationApplication, OrphanRegistration
- VOLUNTEER → VolunteerTask
- ADMIN → cross-cutting management endpoints under `/api/admin`

All form models have a `status` string (default `pending`; values include `confirmed`, `completed`, `approved`, `rejected`, `under_review`) and `userId` FK with `onDelete: Cascade`. When adding a new form type, add the model + relation on `User`, the service/controller/route triplet, the Zod validator, and surface it in the admin aggregation endpoints.

### Frontend

- `client/src/App.jsx` is the single source of routes. Every protected route is wrapped in `<ProtectedRoute>` (auth gate) then `<RoleBasedRoute allowedRoles={[...]}>` (role gate). Add new routes in the same nested pattern.
- `client/src/store/authStore.js` — Zustand store. `loading` initializes to `true` so `ProtectedRoute` does not redirect before `checkAuth()` resolves on page load. Do not change this default without auditing the protected-route logic.
- `client/src/services/*.js` — one file per backend resource, all import the shared `api.js` axios instance. Do not create new axios instances.
- API base URL is `VITE_API_URL` (defaults to `http://localhost:5000/api`).
- Pages are organized by user type: `pages/{auth,dashboard,donor,beneficiary,volunteer,admin}/`.
- Forms use react-hook-form + Zod (`@hookform/resolvers`); toasts via `sonner`.

### Response contract

Backend always returns `{ success, statusCode, message, data?, errors? }` (see `ApiResponse` / `ApiError`). Validation failures return 400 with `errors: [{ field, message }]`. The client interceptor in `api.js` rejects with `{ message, errors, status }` — UI code reads those three keys.
