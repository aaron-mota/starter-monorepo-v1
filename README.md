# Starter Monorepo

A production-ready full-stack monorepo template with a Next.js web app, React Native mobile app, and shared packages. Everything you need to start building a SaaS product — auth, billing, dashboard, API layer, and mobile app — all wired up and ready to go.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web Framework** | Next.js 15 (App Router, Turbopack) |
| **Mobile Framework** | React Native (Expo) |
| **Database** | MongoDB (native driver, no Mongoose) |
| **API Layer** | tRPC with reusable base CRUD procedures |
| **Auth** | Clerk (web + mobile) |
| **Billing** | Stripe (subscriptions, customer portal) |
| **Validation** | Zod (single source of truth for all types) |
| **State** | TanStack React Query (server), nuqs (URL) |
| **UI** | shadcn/ui, Tailwind CSS, Recharts |
| **Email** | Resend |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Testing** | Vitest + Testing Library |

## Opinionated Defaults

This template ships with **Clerk** for authentication and **MongoDB** for the database. These are wired into the auth flow, middleware, API layer, and mobile app out of the box.

If you'd prefer a different auth provider (e.g., NextAuth, Supabase Auth, Firebase Auth) or a different database (e.g., PostgreSQL with Prisma/Drizzle, Supabase, PlanetScale), you can swap them out. The integrations are cleanly separated — auth logic lives in the middleware and layout files, and database access is isolated to the `packages/db` package. Ask Claude to help you migrate to your preferred stack; point it at this README and the [CLAUDE.md](./CLAUDE.md) file for full context on the architecture.

## What's Included

- **Marketing site** — Landing page with features, pricing, FAQ, and legal pages
- **Authentication** — Sign-in, sign-up, and 2FA via Clerk (web + mobile)
- **Dashboard** — Responsive layout with sidebar navigation
- **Settings** — Account management, plan details, notification preferences, device management
- **Billing** — Stripe integration with free/pro tiers, checkout, and customer portal
- **Analytics page** — Placeholder wired up with plan-gated access
- **Mobile app** — Full React Native app with tab navigation, pull-to-refresh, haptic feedback
- **Push notifications** — VAPID web push + Expo push notifications
- **Email** — Weekly digest template via Resend
- **Base CRUD** — Reusable tRPC procedures for any entity (get, create, update, delete)
- **Three-tier schemas** — Client/API/Server schema separation with adapter functions
- **Quality tooling** — ESLint, Prettier, TypeScript strict mode, Vitest, pre-commit hooks

## Project Structure

```
starter-monorepo-base/
├── apps/
│   ├── web/                    # Next.js 15 web application
│   └── mobile/                 # React Native (Expo) mobile app
├── packages/
│   ├── shared/                 # Zod schemas, types, constants
│   ├── db/                     # MongoDB native driver, typed collections
│   ├── trpc/                   # tRPC routers and base CRUD procedures
│   ├── api/                    # REST API client layer with React Query hooks
│   └── ui/                     # Shared UI components
├── scripts/
│   └── setup-env.sh            # Creates .env files from templates
├── CLAUDE.md                   # AI assistant instructions & conventions
├── GETTING_STARTED.md          # Full setup guide (step-by-step)
└── package.json                # Root workspace config
```

### Workspace Packages

| Package | Name | Description |
|---------|------|-------------|
| `packages/shared` | `@starter/shared` | Zod schemas, TypeScript types, constants (plan limits, etc.) |
| `packages/db` | `@starter/db` | MongoDB native driver, typed collections, index definitions |
| `packages/trpc` | `@starter/trpc` | tRPC routers with reusable base CRUD procedures |
| `packages/api` | `@starter/api` | REST API client layer with React Query hooks |
| `packages/ui` | `@starter/ui` | Shared UI components |
| `apps/web` | `@starter/web` | Next.js 15 web application |
| `apps/mobile` | `@starter/mobile` | React Native (Expo) mobile application |

### Dependency Graph

```
@starter/shared → @starter/db → @starter/trpc → @starter/api → @starter/web
                                                              → @starter/mobile
```

No circular dependencies allowed.

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment files

```bash
./scripts/setup-env.sh
```

This creates `.env.local` (web) and `apps/mobile/.env` (mobile) from the example templates, generates a random `CRON_SECRET`, and sets up a symlink for Next.js.

### 3. Add your service credentials

At minimum, you need **MongoDB** and **Clerk** to run the web app:

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/starter   # or MongoDB Atlas URI
MONGODB_DB=starter
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # from dashboard.clerk.com
CLERK_SECRET_KEY=sk_test_...                    # from dashboard.clerk.com
```

For the mobile app, copy the same Clerk key:

```bash
# apps/mobile/.env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000     # not localhost — use your LAN IP
```

> Without Clerk keys, the apps still launch — the web app shows the marketing site and the mobile app shows a setup instructions screen.

### 4. Set up the database

```bash
pnpm db:indexes
```

### 5. Start developing

```bash
pnpm dev        # Start the web app (http://localhost:3000)
```

For the mobile app:

```bash
cd apps/mobile
npx expo start --go     # Start with Expo Go
```

> See [GETTING_STARTED.md](./GETTING_STARTED.md) for the full step-by-step guide, including Stripe setup, push notifications, development builds, and troubleshooting.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages and apps |
| `pnpm check` | Full quality suite (lint + format + type-check + tests) |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Auto-format code with Prettier |
| `pnpm test:run` | Run tests once |
| `pnpm db:indexes` | Create MongoDB indexes |
| `./scripts/setup-env.sh` | Create env files from templates |

## Key Conventions

- **File naming**: kebab-case only (`my-component.tsx`, not `MyComponent.tsx`)
- **Exports**: Named exports everywhere (except Next.js pages which require `export default`)
- **UI components**: Always use shadcn/ui components instead of raw HTML elements
- **Component states**: Every component handles loading (`<Skeleton>`), error (`<Alert>`), empty, and success states
- **Mobile pull-to-refresh**: Every data-fetching screen uses the `useRefresh` hook
- **Database schemas**: Three-tier pattern (client / api / server) with Zod as the source of truth
- **No Mongoose**: Uses the native MongoDB driver directly
- **Server-only**: Files in `server/` directories start with `import "server-only"`

See [CLAUDE.md](./CLAUDE.md) for the complete list of conventions and patterns.

## Customizing for Your Project

Once everything runs, make it yours:

1. Rename `@starter/*` packages to `@yourproject/*` across all `package.json` files and imports
2. Update app branding (name, icons, colors in `globals.css`)
3. Replace the example `Item` entity with your domain entities using the three-tier schema pattern
4. Add your pages, components, and API routes
5. Configure Stripe products/prices for your pricing tiers

## License

MIT
