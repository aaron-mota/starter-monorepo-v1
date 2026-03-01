# Starter Monorepo — Complete Architecture Reference

> This document describes the full architecture of the starter monorepo template.
> It is designed to be copied and adapted for new projects.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Monorepo Structure](#monorepo-structure)
4. [Dependency Graph](#dependency-graph)
5. [Package Deep Dives](#package-deep-dives)
   - [shared — Schema Infrastructure](#1-shared--schema-infrastructure)
   - [db — Database Layer](#2-db--database-layer)
   - [trpc — Server API Layer](#3-trpc--server-api-layer)
   - [api — REST API Client Layer](#4-api--rest-api-client-layer)
   - [ui — Shared UI Components](#5-ui--shared-ui-components)
   - [web — Next.js Application](#6-web--nextjs-application)
   - [mobile — Expo React Native Application](#7-mobile--expo-react-native-application)
6. [Data Flow](#data-flow)
7. [Authentication System](#authentication-system)
8. [Three-Tier Schema Pattern](#three-tier-schema-pattern)
9. [Base Router Factory](#base-router-factory)
10. [Mobile Architecture](#mobile-architecture)
11. [Build & Deployment](#build--deployment)
12. [Testing Strategy](#testing-strategy)
13. [Environment Variables](#environment-variables)

---

## Overview

This is a **full-stack monorepo** for building web + mobile applications with a shared backend. It provides:

- A **Next.js 15** web application with App Router
- An **Expo React Native** mobile application with Expo Router
- A **type-safe API layer** using tRPC with automatic CRUD generation
- A **three-tier schema system** (client/api/server) powered by Zod
- **MongoDB** as the database with native driver (no ORM)
- **Clerk** for authentication across web and mobile
- **Stripe** for subscription billing
- **Push notifications** for both web and mobile

The architecture eliminates boilerplate: adding a new database entity automatically gives you typed schemas, API procedures, React Query hooks, and CRUD operations.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Monorepo** | Turborepo + pnpm | 2.5 / 9.15 | Build orchestration & workspaces |
| **Web Framework** | Next.js (App Router) | 15.3 | SSR/RSC web application |
| **Mobile Framework** | Expo + React Native | SDK 54 / 0.81 | Native iOS/Android app |
| **Language** | TypeScript | 5.8 | End-to-end type safety |
| **Database** | MongoDB (native driver) | 7.1 | Document storage |
| **API Layer** | tRPC | 11.10 | End-to-end type-safe RPC |
| **Server State** | TanStack React Query | 5.80 | Client-side caching & mutations |
| **Validation** | Zod | 3.23 | Single source of truth for types |
| **Web UI** | shadcn/ui + Tailwind CSS v4 | — | Component library + utility CSS |
| **Mobile UI** | NativeWind + shadcn-style | 4.1 | Tailwind CSS for React Native |
| **Auth** | Clerk | 6.38 (web) / 2.11 (mobile) | Authentication & user management |
| **Payments** | Stripe | 18.1 | Subscription billing |
| **Email** | Resend | 6.9 | Transactional email |
| **Charts (Web)** | Recharts | 3.7 | Data visualization |
| **Charts (Mobile)** | Victory Native | 41.20 | React Native charts |
| **Maps** | MapLibre GL | 5.19 | Geospatial visualization |
| **Push (Web)** | Web Push API (VAPID) | — | Browser notifications |
| **Push (Mobile)** | Expo Notifications | 0.32 | Native push notifications |
| **Testing** | Vitest + Testing Library | 4.0 | Unit & component tests |
| **Linting** | ESLint (flat config) | 9.28 | Code quality |
| **Formatting** | Prettier | 3.8 | Code formatting |
| **Git Hooks** | Husky + lint-staged | 9.1 / 15.4 | Pre-commit quality checks |

---

## Monorepo Structure

```
starter-monorepo/
├── apps/
│   ├── web/                        # Next.js 15 web application
│   │   ├── src/
│   │   │   ├── app/                # App Router (pages, layouts, API routes)
│   │   │   ├── components/         # React components (ui/, layout/, shared/, etc.)
│   │   │   ├── lib/                # Hooks, helpers, services, utilities
│   │   │   └── test/               # Test setup
│   │   ├── public/                 # Static assets
│   │   ├── next.config.ts
│   │   ├── vitest.config.ts
│   │   ├── components.json         # shadcn/ui config
│   │   └── package.json
│   │
│   └── mobile/                     # Expo React Native application
│       ├── app/                    # Expo Router (screens, tabs, auth)
│       ├── components/             # Native components (ui/, features)
│       ├── hooks/                  # Custom hooks
│       ├── lib/                    # tRPC client, services, utilities
│       ├── assets/                 # Images, splash screens
│       ├── app.json                # Expo config
│       ├── eas.json                # EAS Build config
│       ├── metro.config.js         # Metro bundler (monorepo support)
│       └── package.json
│
├── packages/
│   ├── shared/                     # Zod schemas, types, constants
│   │   ├── schemas/
│   │   │   ├── database/           # Entity schemas (three-tier pattern)
│   │   │   ├── external/           # Third-party API schemas
│   │   │   ├── services/           # Service ID schemas (Clerk, Stripe)
│   │   │   └── _helpers/           # Schema utilities
│   │   ├── constants/              # App constants (subpath imports)
│   │   └── types/                  # Shared TypeScript types
│   │
│   ├── db/                         # MongoDB native driver wrapper
│   │   └── src/
│   │       ├── client.ts           # Connection singleton
│   │       ├── collections.ts      # Typed collection accessors
│   │       ├── env.ts              # Environment validation
│   │       └── indexes.ts          # Index creation script
│   │
│   ├── trpc/                       # tRPC routers & procedures
│   │   └── src/
│   │       ├── trpc-server.ts      # tRPC initialization
│   │       ├── context.ts          # Request context (DB + auth)
│   │       ├── routers/
│   │       │   ├── _base.ts        # Base router factory (19 CRUD procedures)
│   │       │   ├── _app.ts         # Root app router
│   │       │   ├── _lib/           # Router utilities & base functions
│   │       │   └── [entity]/       # Per-entity routers
│   │       ├── middleware/         # Auth & plan enforcement
│   │       └── lib/                # Utilities (plan resolution, push, etc.)
│   │
│   ├── api/                        # REST API client + React Query hooks
│   │   └── src/
│   │       ├── api-client/         # HTTP fetch wrapper
│   │       ├── helpers/            # Hook factories
│   │       │   └── use-basic-crud-procedure/  # CRUD hook generator
│   │       └── routers/database/   # Per-entity API routers
│   │
│   └── ui/                         # Shared UI components (placeholder)
│       └── src/index.ts
│
├── docs/                           # Documentation
├── .husky/                         # Git hooks
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # Workspace packages definition
├── turbo.json                      # Turborepo task pipeline
├── tsconfig.base.json              # Shared TypeScript config
├── eslint.config.mjs               # Shared ESLint config
├── .prettierrc                     # Prettier config
└── .env.example                    # Environment variable template
```

---

## Dependency Graph

Packages follow a strict **unidirectional** dependency chain. No circular dependencies are allowed.

```
@scope/shared  ──>  @scope/db  ──>  @scope/trpc  ──>  @scope/api  ──>  @scope/web
                                         │
                                         └─────────────────────────────>  @scope/mobile
```

| Package | Depends On | Depended By |
|---------|-----------|-------------|
| **shared** | (none) | db, trpc, api, web, mobile |
| **db** | shared | trpc |
| **trpc** | shared, db | web, mobile |
| **api** | shared | web |
| **ui** | (none) | web, mobile |
| **web** | shared, db, trpc, api, ui | (none) |
| **mobile** | shared, trpc | (none) |

---

## Package Deep Dives

### 1. shared — Schema Infrastructure

The shared package is the **foundation of the type system**. Every database entity follows an identical three-tier folder structure.

#### Package Configuration

```json
{
  "name": "@scope/shared",
  "main": "./schemas/index.ts",
  "exports": {
    ".": "./schemas/index.ts",
    "./schemas/*": "./schemas/*.ts",
    "./constants/*": "./constants/*.ts",
    "./types/*": "./types/*.ts"
  }
}
```

**Critical import rule:** The main entry (`@scope/shared`) only exports schema types. Constants must use subpath imports:

```typescript
// CORRECT — subpath imports for constants
import { SOME_CONSTANT } from '@scope/shared/constants/my-constants'

// CORRECT — main entry for schema types
import type { TUser } from '@scope/shared'

// WRONG — constants not re-exported from main entry
import { SOME_CONSTANT } from '@scope/shared'  // BUILD ERROR
```

#### Entity Schema Structure

Each entity under `schemas/database/[entity-name]/` follows this structure:

```
[entity-name]/
├── _config.ts           # Root barrel export (TYPE, SCHEMA, re-exports client + api)
├── index.ts             # Re-exports _config
├── client/
│   ├── _config.ts       # Client barrel
│   ├── schema.ts        # Zod schemas (schema, schemaCreate, schemaUpdate)
│   ├── types.ts         # TypeScript types (TDoc, TDocCreate, TDocUpdate)
│   └── constants.ts     # DEFAULT_VALUES, field key lists
├── api/
│   ├── _config.ts       # API barrel
│   ├── schema.ts        # API schemas (string timestamps, string IDs)
│   ├── types.ts         # API types (TDocApi, TDocApiCreate, TDocApiUpdate)
│   └── adapterFns.ts    # API <-> Frontend transformations
└── server/
    ├── _config.ts       # Server barrel (imports 'server-only')
    ├── schema.ts        # DB schemas (ObjectId, Date)
    ├── types.ts         # DB types (TDocDb, TDocDbCreate, TDocDbUpdate)
    └── adapterFns.ts    # DB <-> Frontend transformations
```

#### Entity Root _config.ts Pattern

```typescript
import { SomeIcon } from 'lucide-react';

export const TYPE = {
  router: 'entity',           // tRPC router name
  collection: 'Entity',       // MongoDB collection name
  path: 'entities',           // URL path segment
  pathInternal: '/entities',  // Internal route path
  icon: SomeIcon,             // Lucide icon component
  display: { singular: 'Entity', plural: 'Entities' },
  dataTestId: 'entity',
};

export const SCHEMA = schema;
export const SCHEMA_CREATE = schemaCreate;
export const SCHEMA_UPDATE = schemaUpdate;
export const SCHEMA_RELATIONSHIPS = schemaRelationshipFields;

// Re-export all tiers EXCEPT server (never re-export server from root!)
export * from './client/constants';
export * from './client/schema';
export * from './client/types';
export * from './api/types';
export * from './api/schema';
export * from './api/adapterFns';
```

#### Shared Partial Schemas

Common field groups defined once and composed into entity schemas:

| Partial | Fields | Purpose |
|---------|--------|---------|
| `schemaDatabaseObject` | `id, createdAt, updatedAt` | Base fields for every entity |
| `schemaDatabaseObjectDb` | `_id: ObjectId, createdAt, updatedAt` | Server-side variant |
| `schemaGeoPoint` | `type: "Point", coordinates: [lng, lat]` | GeoJSON points |
| `schemaLocation` | `lat, long, location` | Address + coordinates |
| `schemaDeviceInfo` | `deviceId, ua, os, browser` | User agent metadata |
| `schemaSubscriptionTier` | `'free' \| 'pro'` | Plan tier enum |

#### Type Inference Pattern

All TypeScript types are derived from Zod schemas:

```typescript
export type TDoc = z.infer<typeof schema>;
export type TDocCreate = z.infer<typeof schemaCreate>;
export type TDocUpdate = z.infer<typeof schemaUpdate>;
export type TDocApi = z.infer<typeof schemaApi>;
export type TDocDb = z.infer<typeof schemaDb>;
```

---

### 2. db — Database Layer

A thin wrapper around the MongoDB native driver. **No Mongoose** — Zod schemas serve as the source of truth.

#### Key Files

| File | Purpose |
|------|---------|
| `client.ts` | Lazy MongoClient singleton with HMR protection in dev |
| `env.ts` | Zod validation for MONGODB_URI and MONGODB_DB |
| `collections.ts` | Typed collection accessors: `getEntityCollection(db?)` |
| `indexes.ts` | `ensureIndexes()` — creates all MongoDB indexes |
| `index.ts` | Barrel exports |

#### Connection Pattern

```typescript
// client.ts — Lazy initialization with dev HMR protection
let clientPromise: Promise<MongoClient> | null = null;

export function getClientPromise() {
  if (clientPromise) return clientPromise;

  const env = validateEnv();
  const client = new MongoClient(env.MONGODB_URI);

  if (process.env.NODE_ENV === 'development') {
    // Cache on globalThis to survive HMR
    (globalThis as any).__mongoClientPromise ??= client.connect();
    clientPromise = (globalThis as any).__mongoClientPromise;
  } else {
    clientPromise = client.connect();
  }

  return clientPromise;
}
```

#### Collection Accessor Pattern

```typescript
export async function getEntitiesCollection(db?: Db) {
  const database = db ?? await getDb();
  return database.collection<TEntityDb>('entities');
}
```

---

### 3. trpc — Server API Layer

Type-safe RPC procedures using tRPC v11 with a **factory pattern** that generates 19 CRUD procedures per entity.

#### Context Creation

```typescript
// Supports both web (cookie-based) and mobile (bearer token) auth
export async function createContext(req: NextRequest) {
  const { db } = await connectToDatabase();

  // Try cookie auth first (web), then bearer token (mobile)
  let clerkId: string | null = null;
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    // Mobile: verify JWT token
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, { secretKey });
    clerkId = payload.sub;
  } else {
    // Web: use Clerk's cookie-based auth
    const { userId } = await auth();
    clerkId = userId;
  }

  return { db, clerkId };
}
```

#### tRPC Initialization

```typescript
const t = initTRPC.context<Context>().create({
  transformer: superjson,  // Handles Date, Map, Set serialization
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.clerkId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, clerkId: ctx.clerkId } });
});
```

#### createBaseRouter Factory

The core abstraction: generates 19+ CRUD procedures from entity schemas and adapter functions.

**Read Procedures (public by default):**

| Procedure | Input | Description |
|-----------|-------|-------------|
| `getSingleById` | `{ id }` | Fetch by ID |
| `getSingleWhere` | `schema.partial()` | Fetch by partial criteria |
| `getSingleMongo` | MongoDB query | Fetch with raw filter |
| `getLatest` | none | Most recently created |
| `getAll` | none | All documents |
| `getMany` | `schema.partial()` | Filter by fields |
| `getManyMongo` | MongoDB query + sort/skip/limit | Full query capability |
| `getManyOptions` | `schema.partial()` | As select options |
| `getManyLimitedFields` | `schema.partial()` | With projection |
| `getCount` | `schema.partial()` | Count matching |
| `getCountMongo` | MongoDB query | Count with raw filter |
| `getNear` | `{ lat, lng, maxDistanceMeters }` | Geospatial search |

**Write Procedures (protected by default):**

| Procedure | Input | Description |
|-----------|-------|-------------|
| `create` | `schemaCreate` | Insert one |
| `createMany` | `schemaCreate[]` | Insert multiple |
| `update` | `{ id, ...schemaUpdate }` | Update one |
| `updateMany` | `{ ids[], data }` | Update multiple |
| `delete` | `{ id }` | Delete one |
| `deleteMany` | `{ ids[] }` | Delete multiple |
| `deleteMongo` | MongoDB query | Delete with raw filter |

#### Entity Router Pattern

```typescript
// routers/entity/router.ts
import { createBaseRouter } from '../_base';
import {
  schema, schemaCreate, schemaUpdate,
  schemaDb, schemaDbCreate, schemaDbUpdate,
  adapterFnDbToFE, adapterFnFEToDbCreate, adapterFnFEToDbUpdate,
  TYPE,
} from './_config';

export const routerEntity = createBaseRouter({
  routerName: TYPE.router,
  collectionName: TYPE.collection,
}, {
  schema, schemaCreate, schemaUpdate,
  schemaDb, schemaDbCreate, schemaDbUpdate,
}, {
  adapterFnDbToFE, adapterFnFEToDbCreate, adapterFnFEToDbUpdate,
});
```

#### Middleware

| Middleware | Purpose |
|-----------|---------|
| `authorizeOwner` | Verifies caller is the owner or in same family group |
| `planLimits` | Enforces plan-based limits (max entities, feature access) |

#### App Router Aggregation

```typescript
// routers/_app.ts
export const appRouter = router({
  user: routerUser,
  entity: routerEntity,
  // ... all entity routers
});

export type AppRouter = typeof appRouter;
```

---

### 4. api — REST API Client Layer

React Query hooks with a factory pattern mirroring the tRPC layer. Used for REST API endpoints (non-tRPC).

#### useBasicCRUDProcedure Factory

```typescript
const entityApi = useBasicCRUDProcedure<TDoc, TDocApi, TDocCreate, TDocApiCreate, TDocUpdate, TDocApiUpdate>({
  resource: TYPE.path,
  schema,
  adapterFnApiToFE,
  adapterFnFEToApiCreate,
  adapterFnFEToApiUpdate,
});

// Returns hooks:
entityApi.getSingle.useQuery({ id })
entityApi.getSingleWhere.useQuery({ queryParams })
entityApi.getMany.useQuery({ queryParams })
entityApi.create.useMutation()
entityApi.createMany.useMutation()
entityApi.update.useMutation()
entityApi.updateMany.useMutation()
entityApi.delete.useMutation()
entityApi.deleteMany.useMutation()
```

---

### 5. ui — Shared UI Components

Currently a placeholder for cross-platform shared components. Web uses shadcn/ui directly; mobile uses NativeWind-based components.

---

### 6. web — Next.js Application

#### App Router Structure

```
src/app/
├── layout.tsx                              # Root: ClerkProvider > ThemeProvider > TRPCProvider
├── error.tsx                               # Global error boundary
├── globals.css                             # Tailwind v4 with OKLCH design tokens
│
├── (auth)/                                 # Public auth pages
│   ├── sign-in/[[...sign-in]]/page.tsx     # Clerk sign-in
│   └── sign-up/[[...sign-up]]/page.tsx     # Clerk sign-up
│
├── (dashboard)/                            # Protected routes (requires auth)
│   ├── layout.tsx                          # Sidebar + header + onboarding
│   ├── dashboard/page.tsx                  # Main dashboard (stats, activity feeds)
│   ├── [entity]/page.tsx                   # Entity list pages
│   ├── [entity]/[id]/page.tsx              # Entity detail pages
│   ├── settings/page.tsx                   # User settings
│   └── analytics/page.tsx                  # Analytics dashboards
│
├── (marketing)/                            # Public marketing pages
│   ├── layout.tsx                          # Navbar + footer
│   ├── page.tsx                            # Landing page
│   ├── privacy/page.tsx
│   └── terms/page.tsx
│
├── api/                                    # API route handlers
│   ├── trpc/[...trpc]/route.ts             # tRPC endpoint
│   ├── webhook/clerk/route.ts              # Clerk user lifecycle webhook
│   ├── webhook/stripe/route.ts             # Stripe subscription webhook
│   ├── stripe/                             # Stripe API routes
│   ├── push/                               # Web push subscription
│   ├── cron/                               # Scheduled tasks
│   └── export/                             # Data export endpoints
│
└── .well-known/                            # App deep linking
    ├── apple-app-site-association/route.ts  # iOS universal links
    └── assetlinks.json/route.ts            # Android app links
```

#### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  transpilePackages: ['@scope/shared', '@scope/db', '@scope/trpc', '@scope/api', '@scope/ui'],
  outputFileTracingRoot: resolve(__dirname, '../../'),  // Monorepo root for tracing
};
```

#### tRPC Provider Setup

```typescript
// lib/hooks/trpc-provider.tsx
export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

#### Component Architecture

```
src/components/
├── ui/                  # shadcn/ui components (20 components, auto-generated)
├── layout/              # Layout: sidebar, header, theme toggle, onboarding
├── shared/              # Shared: page-header, empty-state, upgrade-prompt, maps
├── dashboard/           # Dashboard: stat cards, activity feeds, timeline charts
├── analytics/           # Analytics: trend cards, charts, leaderboards
├── [entity]/            # Entity-specific: CRUD dialogs, cards, filters
├── settings/            # Settings: notification preferences
└── database/            # Typed document display components
```

#### shadcn/ui Components Available

alert, avatar, badge, button, card, checkbox, dialog, dropdown-menu, input, label, progress, scroll-area, select, separator, sheet, skeleton, switch, tabs, textarea, tooltip

#### Key Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentUser()` | Clerk user + tRPC user record + ownerId |
| `useTrpc()` | tRPC client instance |
| `useIsMobile()` | Media query for mobile breakpoint |
| `useIsIos()` | User agent detection for iOS |

#### Webhook Handlers

| Endpoint | Trigger | Action |
|----------|---------|--------|
| `/api/webhook/clerk` | `user.created` / `user.deleted` | Create/delete user + subscription docs |
| `/api/webhook/stripe` | Subscription events | Update subscription status |
| `/api/cron/weekly-digest` | Cron schedule | Send email digest via Resend |

#### Middleware

```typescript
// middleware.ts — Clerk auth middleware
const isPublicRoute = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)',
  '/api/webhook(.*)', '/api/trpc(.*)',
  // ... other public routes
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});
```

---

### 7. mobile — Expo React Native Application

#### Expo Configuration

- **SDK:** Expo 54 (React Native 0.81.5)
- **Router:** Expo Router (file-based, like Next.js App Router)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Build:** EAS Build (development, preview, production profiles)
- **New Architecture:** Enabled

#### App Structure

```
app/
├── _layout.tsx              # Root: ClerkProvider > TRPCProvider > Stack navigator
├── +not-found.tsx           # 404 screen
├── (auth)/                  # Unauthenticated stack
│   ├── _layout.tsx
│   ├── sign-in.tsx          # Email/password + 2FA
│   └── sign-up.tsx          # Email verification flow
├── (tabs)/                  # Authenticated tab navigator (5 tabs)
│   ├── _layout.tsx          # Bottom tab bar with haptic feedback
│   ├── (dashboard)/         # Dashboard tab
│   ├── (entity-list)/       # Entity listing tab
│   ├── (analytics)/         # Analytics tab (Pro-only charts)
│   ├── (groups)/            # Group/family tab
│   └── (settings)/          # Settings tab
└── [entity]/                # Deep link handler
    └── [id].tsx
```

#### tRPC Mobile Client

```typescript
// lib/trpc/trpc-client.ts
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${EXPO_PUBLIC_API_URL}/api/trpc`,
      transformer: superjson,
      headers: async () => ({
        authorization: `Bearer ${await getClerkInstance().session?.getToken()}`,
      }),
    }),
  ],
});
```

#### React Query Persistence

```typescript
// Mobile uses AsyncStorage persistence with superjson for Date handling
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  serialize: (data) => superjson.stringify(data),
  deserialize: (data) => superjson.parse(data),
});

// staleTime: 0 — always refetch on mount (cached data shown instantly)
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, gcTime: 1000 * 60 * 60 * 24 } },
});
```

#### Mobile Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentUser()` | Clerk user + tRPC user record |
| `useRefresh()` | Pull-to-refresh (invalidates all queries) |
| `useDeviceInfo()` | Native device ID, platform, model, OS version |
| `useAutoRegisterDevice()` | Auto-register device on first auth |
| `usePushRegistration()` | Register Expo push token |
| `useColorScheme()` | Dark mode toggle |

#### Mobile UI Components (shadcn-style)

badge, button, card, input, separator, skeleton, switch, text

#### Metro Bundler Configuration (Monorepo)

```javascript
// metro.config.js
config.watchFolders = ['../../packages/shared', '../../packages/trpc'];
config.resolver.nodeModulesPaths = ['./node_modules', '../../node_modules'];
config.resolver.extraNodeModules = {
  react: './node_modules/react',
  'react-native': './node_modules/react-native',
};
```

#### Pull-to-Refresh Pattern (Required)

Every screen with data queries MUST use pull-to-refresh:

```tsx
import { useRefresh } from '@/hooks/use-refresh';

const { refreshing, onRefresh } = useRefresh();

// ScrollView:
<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

// FlatList:
<FlatList refreshing={refreshing} onRefresh={onRefresh} />
```

---

## Data Flow

### Web Request Flow

```
Browser → Next.js Page → trpc.entity.procedure.useQuery()
    ↓
React Query (check cache) → POST /api/trpc
    ↓
tRPC fetch handler → createContext(req) → { db, clerkId }
    ↓
Base router procedure (e.g., getSingleByIdFn)
    ↓
MongoDB query (with ObjectId conversion)
    ↓
adapterFnDbToFE (ObjectId → string, format dates)
    ↓
superjson serialize → Response → React Query cache → UI update
```

### Mobile Request Flow

```
React Native Screen → trpc.entity.procedure.useQuery()
    ↓
React Query (check AsyncStorage cache) → POST ${API_URL}/api/trpc
    ↓  (Authorization: Bearer ${clerkToken})
tRPC fetch handler → createContext(req) → { db, clerkId }
    ↓
(same server-side flow as web)
    ↓
superjson serialize → Response → React Query cache → AsyncStorage persist → UI update
```

### Webhook Flow

```
External Service (Clerk/Stripe) → POST /api/webhook/[service]
    ↓
Verify signature (Svix/Stripe)
    ↓
Process event → MongoDB operations
    ↓
(optional) Send push notification / email
    ↓
Return 200 OK
```

---

## Authentication System

### Web (Cookie-Based)

1. Clerk handles sign-in/sign-up UI
2. Next.js middleware checks auth on protected routes
3. tRPC context reads Clerk session from cookies
4. `useCurrentUser()` hook provides user data to components

### Mobile (Bearer Token)

1. `@clerk/clerk-expo` handles sign-in/sign-up
2. Clerk session token stored in `expo-secure-store`
3. tRPC httpBatchLink sends `Authorization: Bearer ${token}` header
4. tRPC context verifies JWT token using `@clerk/backend`
5. `useCurrentUser()` hook provides user data to screens

### User Creation Flow

1. User signs up via Clerk (web or mobile)
2. Clerk fires `user.created` webhook to `/api/webhook/clerk`
3. Webhook handler creates User document + SubscriptionUser document in MongoDB
4. On next tRPC call, `useCurrentUser()` fetches the app user record by `clerkId`

---

## Three-Tier Schema Pattern

### Why Three Tiers?

| Tier | IDs | Timestamps | Used By |
|------|-----|-----------|---------|
| **Client** | `string` (24-char hex) | `Date` objects | React components, hooks, state |
| **API** | `string` (24-char hex) | `string` (ISO 8601) | HTTP request/response bodies |
| **Server** | `ObjectId` (BSON) | `Date` objects | MongoDB queries, tRPC procedures |

### Adapter Functions

Each entity provides four adapter functions:

```typescript
// Server → Client (after DB reads)
adapterFnDbToFE(doc: TDocDb): TDoc
  // ObjectId._id → string id
  // Timestamps stay as Date

// Client → Server (for inserts)
adapterFnFEToDbCreate(doc: TDocCreate): TDocDbCreate
  // string → new ObjectId()
  // Sets createdAt + updatedAt

// Client → Server (for updates)
adapterFnFEToDbUpdate(doc: TDocUpdate): TDocDbUpdate
  // string → new ObjectId() (for relationship fields)
  // Sets updatedAt

// API → Client (in REST hooks)
adapterFnApiToFE(doc: TDocApi): TDoc
  // _id → id
  // ISO string → new Date()
```

---

## Base Router Factory

### How It Works

1. **Define schemas** in `@scope/shared` (client + api + server tiers)
2. **Create entity router** that calls `createBaseRouter` with schemas + adapter functions
3. **Get 19 procedures** automatically — read, write, geospatial
4. **Override/extend** with custom procedures as needed

### Adding a New Entity

1. Create schema folder: `packages/shared/schemas/database/new-entity/`
2. Copy from `_template/` and customize schemas
3. Add collection accessor to `packages/db/src/collections.ts`
4. Add indexes to `packages/db/src/indexes.ts`
5. Create router: `packages/trpc/src/routers/new-entity/`
6. Register in `packages/trpc/src/routers/_app.ts`
7. (Optional) Create API router in `packages/api/src/routers/database/new-entity/`

---

## Build & Deployment

### Turborepo Pipeline

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "type-check": {},
    "test:run": { "dependsOn": ["^build"] }
  }
}
```

### Web Deployment (Vercel)

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@scope/web...",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "ignoreCommand": "npx turbo-ignore"
}
```

### Mobile Build (EAS)

```bash
# Development build (physical device)
eas build --profile development-device --platform ios

# Preview build (internal distribution)
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform ios
```

### Quality Check Script

```bash
pnpm check  # Runs: lint → format:check → type-check → test:run
```

### Git Hooks

- **pre-commit:** lint-staged (ESLint + Prettier) + turbo type-check
- **pre-push:** (configurable)

---

## Testing Strategy

### Framework

- **Runner:** Vitest 4.0 with `@vitejs/plugin-react`
- **Environment:** jsdom
- **Libraries:** @testing-library/react, @testing-library/jest-dom
- **Pattern:** Co-located tests in `__tests__/` directories

### Test Setup

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test_123' }, isLoaded: true }),
  ClerkProvider: ({ children }) => children,
}));
```

### Commands

```bash
pnpm test:run    # Run all tests once
pnpm test        # Watch mode (web app only)
```

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...
MONGODB_DB=myapp

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# App URLs
NEXT_PUBLIC_APP_URL=https://myapp.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (Resend)
RESEND_API_KEY=re_...

# Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:hello@myapp.com

# Cron Security
CRON_SECRET=your-random-secret

# Mobile
EXPO_PUBLIC_API_URL=https://myapp.com
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```
