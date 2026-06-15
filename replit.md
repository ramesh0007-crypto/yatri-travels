# Yatri Travels

A full-stack pilgrimage & tours travel platform for sacred destinations (Kedarnath, Char Dham, Vaishno Devi, etc.) based in Kapilvastu, Nepal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/yatri-travels run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + wouter + framer-motion
- API: Express 5 + JWT auth (stored in localStorage as `yatri_token`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Payments: Stripe (with mock fallback when no STRIPE_SECRET_KEY)

## Where things live

- `artifacts/yatri-travels/` — React+Vite frontend (previewPath `/`)
- `artifacts/api-server/` — Express API server (previewPath `/api`)
- `lib/db/src/schema/` — Drizzle ORM schema (users, packages, bookings, reviews, gallery, contacts)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — Generated Zod schemas

## Architecture decisions

- JWT tokens stored in localStorage under key `yatri_token`; `setAuthTokenGetter` in `custom-fetch.ts` attaches Bearer header automatically.
- Stripe payments: when `STRIPE_SECRET_KEY` is not set, payment sessions are mocked and bookings auto-confirmed (for demo).
- Featured packages shown on home page; `featured: true` flag in packages table.
- Admin access controlled by `role = 'admin'` in users table; `requireAdmin` middleware enforces it.
- Default admin: `admin@yatritravels.com` / `admin123`.

## Product

- Public: Browse 11 pilgrimage packages, photo gallery, contact form, destination search/filter
- Authenticated: Book packages, view/manage bookings, leave reviews, pay via Stripe
- Admin: Full CRUD on packages, bookings, users, reviews, gallery, contacts; admin dashboard with stats

## User preferences

- Warm saffron/earth tone theme (Playfair Display serif + Inter sans)
- Sacred pilgrimage focus — India & Nepal destinations
- Based in Kapilvastu, Nepal

## Gotchas

- Zod schema names: `CreatePackageBody` (not `PackageInput`), `UpdatePackageBody` (not `PackageUpdate`), `UpdateBookingBody` (not `BookingUpdate`), `CreatePaymentSessionBody` (not `PaymentSessionInput`).
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`.
- Google Fonts `@import url(...)` MUST be the very first line of `index.css` — before `@import "tailwindcss"`.
- `setAuthTokenGetter` is imported from `@workspace/api-client-react` (the main barrel export), not from a sub-path.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
