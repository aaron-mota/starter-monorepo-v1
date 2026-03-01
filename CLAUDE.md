# Starter Monorepo

A full-stack monorepo starter template with a Next.js web app, React Native mobile app, and shared packages.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB (native driver, no Mongoose)
- **State**: TanStack React Query (server state), nuqs (URL state)
- **UI**: shadcn/ui components, Tailwind CSS, Recharts
- **Validation**: Zod (source of truth for all types)
- **API Layer**: tRPC with reusable base router procedures
- **Auth**: Clerk
- **Monorepo**: Turborepo + pnpm workspaces

## Commands

```bash
pnpm dev          # Start all development servers
pnpm build        # Build all packages and apps
pnpm check        # Run full quality suite (lint + format + type-check + tests)
pnpm lint:fix     # Auto-fix lint issues
pnpm format       # Auto-format code
pnpm test:run     # Run tests once
pnpm db:indexes   # Create MongoDB indexes
pnpm db:setup     # Create indexes (run after DB wipe)
```

## Workspace Packages

| Package | Name | Description |
|---|---|---|
| `packages/shared` | `@starter/shared` | Zod schemas, types, constants |
| `packages/db` | `@starter/db` | MongoDB native driver, typed collections |
| `packages/trpc` | `@starter/trpc` | tRPC routers and base CRUD procedures |
| `packages/api` | `@starter/api` | REST API client layer with React Query hooks |
| `packages/ui` | `@starter/ui` | Shared UI components |
| `apps/web` | `@starter/web` | Next.js 15 web application |

## Key Conventions

### File Naming: kebab-case ONLY

ALL files and folders MUST use kebab-case:
- `my-component.tsx` (NOT `MyComponent.tsx`)
- `use-my-hook.ts` (NOT `useMyHook.ts`)
- `my-feature/` (NOT `MyFeature/`)

### Exports

Use **named exports**, not default exports:
```typescript
// Correct
export function MyComponent() { }

// Wrong
export default function MyComponent() { }
```

Exception: Next.js page components use `export default` (required by framework).

### shadcn/ui Components - ALWAYS USE

Never use raw HTML elements when shadcn has a component:
- `<Button>` instead of `<button>`
- `<Card>`, `<CardHeader>`, etc. for card layouts
- `<Table>`, `<TableBody>`, etc. for tables
- `<Input>` instead of `<input>`
- `<Select>` for dropdowns
- `<Skeleton>` for loading states
- `<Alert>` for error states

### Database Schema Pattern (Three-Tier)

Each database entity uses the `client/` + `api/` + `server/` folder structure:
```
packages/shared/schemas/database/[entity-name]/
├── _config.ts           # Root TYPE + SCHEMA exports
├── client/
│   ├── _config.ts       # Client-side re-exports
│   ├── schema.ts        # Zod schemas (schema, schemaCreate, schemaUpdate)
│   ├── types.ts         # TypeScript types (TDoc, TDocCreate, TDocUpdate)
│   └── constants.ts     # DEFAULT_VALUES, KEYS_*
├── api/
│   ├── _config.ts       # API re-exports
│   ├── schema.ts        # API schemas (schemaApi, schemaApiCreate, schemaApiUpdate)
│   ├── types.ts         # API types (TDocApi, TDocApiCreate, TDocApiUpdate)
│   └── adapterFns.ts    # API <-> FE transformations
└── server/
    ├── _config.ts       # Server re-exports (import "server-only")
    ├── schema.ts        # DB schemas (schemaDb, schemaDbCreate, schemaDbUpdate)
    ├── types.ts         # DB types (TDocDb, TDocDbCreate, TDocDbUpdate)
    └── adapterFns.ts    # DB <-> FE transformations
```

### No Mongoose

The architecture uses the native MongoDB driver (`mongodb` package). No Mongoose models. Zod schemas are the source of truth.

### server-only Imports

Every file in `server/` directories starts with `import "server-only"`. Entity-level barrel exports (`_config.ts`) only re-export from `client/` and `api/` -- never from `server/`.

### Component States

Every component must handle:
1. Loading state (use `<Skeleton>`)
2. Error state (use `<Alert variant="destructive">`)
3. Empty state (show meaningful message)
4. Success state (main content)

### Mobile Screens -- Pull-to-Refresh

Every mobile screen that fetches data MUST include pull-to-refresh using the `useRefresh` hook:
```tsx
import { RefreshControl, ScrollView } from 'react-native';
import { useRefresh } from '@/hooks/use-refresh';

const { refreshing, onRefresh } = useRefresh();

// ScrollView:
<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

// FlatList (built-in props):
<FlatList refreshing={refreshing} onRefresh={onRefresh} />
```
The hook calls `utils.invalidate()` which refetches all tRPC queries. This is the standard pattern -- do not skip it.

### @starter/shared Imports

The main entry (`@starter/shared`) only exports schema types. Constants use subpath imports via `typesVersions`:
- `@starter/shared/constants/categories` -- category display names and icons
- `@starter/shared/constants/plans` -- `PLAN_LIMITS`, `PlanTier`

Never import constants from `@starter/shared` directly -- it will cause a build error.

### Testing

Test framework: Vitest + @testing-library/react (jsdom)
- Config: `apps/web/vitest.config.ts`
- Setup: `apps/web/src/test/setup.ts` (mocks Clerk, next/navigation, next/link)
- Run: `pnpm test:run`
- Pattern: co-locate tests in `__tests__/` directories next to source files

### React Query

Always cast `res.json()` results: `(await res.json()) as MyType`

## Verification

After making changes, always run:
```bash
pnpm check
```

This runs: lint -> format:check -> type-check -> test:run

## Dependency Graph

```
@starter/shared -> @starter/db -> @starter/trpc -> @starter/api -> @starter/web
```

No circular dependencies allowed.
