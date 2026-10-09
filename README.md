# LMS Frontend

Borrower portal and operations dashboard for the Loan Management System.

- **Stack:** Next.js 15 (App Router), TypeScript (strict), Tailwind CSS 4
- **API & product docs:** [`lms-backend/docs/`](../lms-backend/docs/) — start with [01-requirements.md](../lms-backend/docs/01-requirements.md) and [05-api-design.md](../lms-backend/docs/05-api-design.md)

---

## Prerequisites

- Node.js 20+
- Running `lms-backend` locally (`http://localhost:4000`) or a remote API URL
- npm

## Setup and Run

```bash
cd lms-frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3000`  
API (default): `http://localhost:4000/api/v1`

Point `NEXT_PUBLIC_API_BASE_URL` at the deployed API if needed, e.g. `http://144.24.159.70/api/v1`. Ensure backend `CORS_ORIGIN` includes `http://localhost:3000`.

## Environment Configuration

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base including `/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | UI label |

Only public variables use the `NEXT_PUBLIC_` prefix.

## What’s in this scaffold (Phase 5)

- Typed API client (`src/lib/api.ts`) with envelope + `ApiError`
- Auth context (JWT in `localStorage`), login / borrower register
- Role home redirects: borrower → `/borrower`, ops → `/dashboard…`
- Route guards: borrowers never see ops chrome; ops modules filtered by role (admin sees all)
- Placeholder pages for borrower portal and sales / sanction / disbursement / collection

Seed users (backend): `admin@lms.local` … `borrower@lms.local` / `Password123!`

## Auth and RBAC

UI guards mirror [`lms-backend/docs/06-rbac.md`](../lms-backend/docs/06-rbac.md). Hiding UI is not enough — the API enforces access.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Deployment

Served behind Nginx alongside the API on the Oracle Cloud VM (see [`lms-backend/docs/08-deployment.md`](../lms-backend/docs/08-deployment.md)). Deploy only after approval.
