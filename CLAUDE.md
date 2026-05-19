# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Hono (Node.js), hono-openapi, Zod |
| Auth | better-auth (email/password + organizations + invitations) |
| Database | PostgreSQL 17, Drizzle ORM |
| Local infra | Docker Compose, Traefik |
| Monorepo | npm workspaces |

## Setup & running

```bash
./init.sh       # npm install
./start.sh      # docker compose up -d
```

The app is served at `http://localhost:3000`. Traefik routes:
- `/` → Next.js frontend (port 3000 in container)
- `/api/` → Hono API (port 3000 in container, `/api` prefix stripped)
- `/api/reference` → Scalar interactive API docs

Each package needs its own `.env.local` (not committed):

**`packages/api/.env.local`**
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**`packages/app/.env.local`**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common commands

All commands run inside Docker containers (the Node processes live there):

```bash
# Start a single service
docker compose up api -d
docker compose up app -d

# Regenerate typed API client (API must be running)
docker compose run --rm app npm run generate:client

# Database migrations
docker compose run --rm api npm run db:generate   # after editing schema.ts
docker compose run --rm api npm run db:migrate

# Drizzle Studio (DB GUI)
docker compose run --rm api npm run db:studio

# Lint (frontend)
docker compose run --rm app npm run lint

# psql access
docker compose run --rm -e PGPASSWORD=postgres postgres psql -h postgres -U postgres -d app
```

DBGate (web DB browser) is available at `http://localhost:1212`.

## Architecture

### Request flow

Browser → Traefik (`:3000`) → Next.js (`/`) or Hono (`/api/*`, prefix stripped)

The frontend calls the API via `/api` (same origin), handled transparently by Traefik in Docker and by Next.js `rewrites` in dev.

### API (`packages/api`)

- `src/server.ts` — entrypoint, starts `@hono/node-server`
- `src/app.ts` — all routes; every route must use `describeRoute()` with a `resolver(z.object(...))` schema so the OpenAPI spec stays accurate
- `src/db/index.ts` — Drizzle client (`db`)
- `src/db/schema.ts` — table definitions; edit here then run generate + migrate
- `drizzle/` — generated migration files (commit these)
- `drizzle.config.ts` — Drizzle Kit config

Adding a route: add it in `src/app.ts` with `describeRoute`, then regenerate the frontend client.

### Frontend (`packages/app`)

- `lib/api.ts` — exports `api` (raw fetch client) and `$api` (React Query wrapper), both typed from the generated spec
- `lib/generated-api.ts` — **never edit by hand**; always regenerate with `npm run generate:client`
- `lib/auth-client.ts` — better-auth React client; exports `useSession`, `useListOrganizations`, `useActiveOrganization`, `signIn`, `signUp`, `signOut`, `organization`
- `proxy.ts` — Next.js 16 proxy (renamed from `middleware`); protects routes, redirects unauthenticated users to `/sign-in`
- Uses shadcn/ui components (see `components.json`); add new ones with `npx shadcn add <component>`

### Auth architecture

- better-auth runs inside Hono at `/auth/*` (→ public path `/api/auth/*` via Traefik)
- `basePath: "/auth"` in `src/auth.ts` is critical — it must match the internal Hono path
- The auth client uses `basePath: "/api/auth"` (public path)
- Organization plugin adds: create/update/delete org, invite members (email logged to console in dev), accept/reject invitations, manage roles (owner/admin/member)
- Invitation links point to `/accept-invitation/[id]` on the frontend

### Auth pages

| Route | Description |
|---|---|
| `/sign-in` | Email/password login |
| `/sign-up` | Account creation |
| `/dashboard` | Org list, protected |
| `/org/new` | Create organization |
| `/org/[slug]/members` | Manage members, invite |
| `/accept-invitation/[id]` | Accept/reject invitation (public) |

### Type sharing

API types flow one way: Hono schema (Zod) → OpenAPI spec → `openapi-typescript` → `lib/generated-api.ts` → consumed by `api`/`$api`. Never write API types manually in the frontend.

## Conventions

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, etc.
- Shared TypeScript code goes through npm workspaces — no copy-paste between packages.

## Next.js 16 specifics

- `middleware.ts` is deprecated → use `proxy.ts` with a named `export function proxy(...)` (not default, not async unless needed)
- Before writing Next.js-specific code, consult https://nextjs.org/docs

## Known environment quirk

Turbopack logs `CPU doesn't support the bmi2 instructions` panics in this Docker environment — these are harmless worker thread crashes and do not affect the app's functionality.
