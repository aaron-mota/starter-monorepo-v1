# Starter Monorepo — Product Requirements Document (PRD)

> Defines what this starter template provides, its capabilities, and how new projects use it.

---

## 1. Purpose

The Starter Monorepo is a **production-ready template** for building full-stack web + mobile applications. It eliminates weeks of boilerplate setup by providing:

- Pre-configured monorepo infrastructure (Turborepo + pnpm)
- End-to-end type-safe API layer (tRPC + Zod)
- Authentication system (Clerk, web + mobile)
- Database layer with automatic CRUD (MongoDB + base router factory)
- Subscription billing (Stripe)
- Push notifications (web + mobile)
- Email service (Resend)
- Test infrastructure (Vitest + Testing Library)
- Quality tooling (ESLint, Prettier, Husky, lint-staged)

---

## 2. Target User

Developers who want to rapidly build and ship full-stack applications with:
- A **Next.js web dashboard** for managing data
- A **React Native mobile app** (iOS/Android) for on-the-go access
- A **shared backend** powering both platforms

---

## 3. What's Included

### 3.1 Monorepo Infrastructure

| Feature | Implementation | Notes |
|---------|---------------|-------|
| Package manager | pnpm 9.15 with workspaces | Hoisted node_modules |
| Build system | Turborepo 2.5 | Smart caching, dependency-aware builds |
| TypeScript | 6.0 (strict) | Shared base tsconfig |
| Linting | ESLint 9 (flat config) | TypeScript-aware, React plugin |
| Formatting | Prettier 3.8 | Tailwind + import sorting plugins |
| Git hooks | Husky + lint-staged | Pre-commit: lint + format + type-check |
| Quality gate | `pnpm check` | lint → format → type-check → test |

### 3.2 Packages

#### @scope/shared — Schema Infrastructure

- **Three-tier Zod schemas** (client/api/server) for every entity
- **Adapter functions** for data transformation between tiers
- **Type inference** — all TypeScript types derived from Zod
- **Shared partials** — reusable schema fragments (database object, geo point, device info)
- **Constants** via subpath imports (`@scope/shared/constants/*`)
- **Template** for adding new entities (`_template/` directory)

#### @scope/db — Database Layer

- **MongoDB native driver** (no Mongoose)
- **Lazy connection singleton** with HMR protection
- **Typed collection accessors** per entity
- **Index management** script (`ensureIndexes`)
- **Seed scripts** for initial data

#### @scope/trpc — Server API Layer

- **Base router factory** generating 19 CRUD procedures per entity
- **tRPC v11** with superjson transformer
- **Dual auth support** — cookies (web) + bearer tokens (mobile)
- **Middleware** — authorization checks, plan limit enforcement
- **Custom procedures** — extensible beyond base CRUD
- **MongoDB query support** — operators ($eq, $gt, $in, $regex, etc.)
- **Geospatial queries** — getNear with 2dsphere indexes

#### @scope/api — REST API Client

- **useBasicCRUDProcedure** factory — generates React Query hooks
- **HTTP client** wrapper (get, post, put, delete)
- **Adapter function integration** — automatic API → Frontend transformation
- **Zod validation** on responses

#### @scope/ui — Shared UI (Placeholder)

- Reserved for cross-platform shared components
- Currently empty, ready for buildout

### 3.3 Web Application (Next.js 16)

| Feature | Implementation |
|---------|---------------|
| Framework | Next.js 16 with App Router + Turbopack |
| Styling | Tailwind CSS v4 with OKLCH design tokens |
| Components | shadcn/ui (new-york style, 20 components) |
| Auth | Clerk with middleware-based route protection |
| State | tRPC + React Query (server state) |
| Charts | Recharts for data visualization |
| Maps | MapLibre GL for geospatial views |
| Dark mode | next-themes with system preference detection |
| Testing | Vitest + @testing-library/react |

**Route Structure:**
- `(auth)/` — Sign-in, sign-up (public)
- `(dashboard)/` — Protected app pages
- `(marketing)/` — Landing page, legal pages (public)
- `api/` — tRPC endpoint, webhooks, Stripe routes, push, cron, export

**Webhooks:**
- Clerk user lifecycle (create/delete user records)
- Stripe subscription events
- Cron-based email digest

### 3.4 Mobile Application (Expo)

| Feature | Implementation |
|---------|---------------|
| Framework | Expo SDK 54 + React Native 0.81 |
| Router | Expo Router (file-based, App Router style) |
| Styling | NativeWind 4.1 (Tailwind for RN) |
| Components | shadcn-style native components (8 components) |
| Auth | @clerk/clerk-expo with secure storage |
| State | tRPC + React Query with AsyncStorage persistence |
| Charts | Victory Native |
| Push | Expo Notifications |
| Haptics | expo-haptics on tab presses |
| Build | EAS Build (dev, preview, production profiles) |

**Navigation:**
- Auth stack (sign-in, sign-up)
- Tab navigator (5 tabs: dashboard, list, analytics, groups, settings)
- Deep link handling

**Mobile-Specific Patterns:**
- Pull-to-refresh on every data screen
- staleTime: 0 (refetch on mount, cached data shown instantly)
- AsyncStorage persistence with superjson Date serialization
- Device registration for push notifications

### 3.5 Services Integration

| Service | Purpose | Package |
|---------|---------|---------|
| **Clerk** | Authentication (web + mobile) | @clerk/nextjs, @clerk/clerk-expo |
| **MongoDB** | Database | mongodb (native driver) |
| **Stripe** | Subscription billing | stripe |
| **Resend** | Transactional email | resend |
| **Web Push** | Browser notifications | web-push (VAPID) |
| **Expo Push** | Mobile notifications | expo-notifications |
| **Vercel** | Web deployment | vercel.json |
| **EAS** | Mobile builds | eas.json |

---

## 4. Key Architectural Decisions

### 4.1 Why MongoDB + Zod (No Mongoose)?

- **Zod schemas** serve as the single source of truth for validation and types
- **Native driver** gives full control over queries without ORM overhead
- **Three-tier schema pattern** cleanly separates frontend, API, and database concerns
- **Adapter functions** handle all data transformation in a predictable way

### 4.2 Why tRPC + Base Router Factory?

- **Zero API boilerplate** — adding an entity gets you 19 typed procedures automatically
- **End-to-end type safety** — client knows exact input/output types at compile time
- **Extensible** — custom procedures can override or extend base CRUD
- **Dual platform** — same server powers web and mobile via different auth mechanisms

### 4.3 Why Turborepo + pnpm?

- **Smart caching** — only rebuilds what changed
- **Dependency-aware** — builds packages in correct order
- **pnpm workspaces** — efficient disk usage, strict dependency resolution
- **Parallel execution** — fast dev/build across all packages

### 4.4 Why Clerk?

- **Drop-in auth** for both web (Next.js) and mobile (Expo)
- **Webhook system** for syncing user data to MongoDB
- **Middleware** for route protection
- **Bearer token** support for mobile API calls

### 4.5 Why shadcn/ui?

- **Copy-paste components** — no package lock-in, full control
- **Tailwind-based** — consistent with the styling system
- **Accessible** — built on Radix UI primitives
- **Customizable** — modify directly in `components/ui/`

---

## 5. Entity System

### 5.1 What You Get Per Entity

When you add a new entity following the template, you automatically get:

**In @scope/shared:**
- Zod schemas for client, API, and server tiers
- TypeScript types inferred from schemas
- Adapter functions for data transformation
- Default values and field key constants
- Entity configuration (TYPE) with metadata

**In @scope/db:**
- Typed collection accessor
- MongoDB indexes

**In @scope/trpc:**
- 19 CRUD procedures (read, write, geospatial)
- Proper auth guards on write operations
- Full MongoDB query support

**In @scope/api:**
- React Query hooks for all CRUD operations
- Automatic response validation
- Type-safe mutations with cache invalidation

### 5.2 Included Example Entities

The template includes these entities as working examples:

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **User** | App user (synced from Clerk) | clerkId, email, name, plan |
| **Item** | Generic entity owned by user | name, description, ownerId |
| **SubscriptionUser** | Stripe subscription tracking | userId, stripeSubscriptionId, tier |

*(Additional example entities may be included to demonstrate relationships, groups, etc.)*

---

## 6. Feature Capabilities Matrix

| Capability | Web | Mobile | Notes |
|-----------|-----|--------|-------|
| User authentication | ✅ | ✅ | Clerk (cookies / bearer token) |
| CRUD operations | ✅ | ✅ | tRPC + React Query |
| Real-time data refresh | ✅ | ✅ | React Query refetch / pull-to-refresh |
| Push notifications | ✅ | ✅ | VAPID / Expo Push |
| Offline cache | ❌ | ✅ | AsyncStorage persistence |
| Dark mode | ✅ | ✅ | next-themes / NativeWind |
| Subscription billing | ✅ | ❌ | Stripe (web portal) |
| Data export | ✅ | ❌ | CSV export endpoint |
| Charts/analytics | ✅ | ✅ | Recharts / Victory Native |
| Maps/geospatial | ✅ | ❌ | MapLibre GL |
| Email notifications | ✅ | N/A | Resend (cron-based digest) |
| Deep links | ✅ | ✅ | .well-known + universal links |
| Onboarding flow | ✅ | ❌ | Checklist + banners |
| Admin tools | ✅ | ❌ | Plan override toggle (dev only) |

---

## 7. Non-Functional Requirements

| Requirement | Implementation |
|-------------|---------------|
| **Type Safety** | End-to-end via Zod + tRPC + TypeScript strict mode |
| **Code Quality** | ESLint + Prettier + pre-commit hooks + `pnpm check` |
| **Performance** | Turborepo caching, React Query caching, Turbopack dev server |
| **Security** | Clerk auth, webhook signature verification, server-only guards |
| **Accessibility** | Radix UI primitives (keyboard nav, ARIA attributes) |
| **Testing** | Vitest + Testing Library with co-located tests |
| **Developer Experience** | Hot reload, type autocomplete, fast builds, template patterns |

---

## 8. Getting Started

See [starter-setup-guide.md](./starter-setup-guide.md) for detailed setup instructions.

See [starter-architecture.md](./starter-architecture.md) for the complete architecture reference.

See [starter-conventions.md](./starter-conventions.md) for coding conventions and patterns.
