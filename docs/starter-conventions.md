# Starter Monorepo — Coding Conventions & Patterns

> Enforced conventions and patterns for consistency across the monorepo.

---

## File Naming: kebab-case Only

ALL files and folders MUST use kebab-case:

```
✅ my-component.tsx
✅ use-my-hook.ts
✅ my-feature/
✅ action-config-fields.tsx

❌ MyComponent.tsx
❌ useMyHook.ts
❌ MyFeature/
❌ ActionConfigFields.tsx
```

---

## Exports: Named Only

Use **named exports**, not default exports:

```typescript
// ✅ Correct
export function MyComponent() { }
export const myHelper = () => { }

// ❌ Wrong
export default function MyComponent() { }
```

**Exception:** Next.js page components use `export default` (required by framework).

---

## Import Ordering

Enforced by Prettier plugin (`@ianvs/prettier-plugin-sort-imports`):

1. (blank line)
2. React / Next.js imports
3. Relative imports
4. Built-in Node modules
5. Third-party types
6. Third-party modules
7. Workspace types
8. Workspace + alias imports (`@scope/*`, `@/*`)
9. Relative types

---

## TypeScript

### Prefer Type Imports

```typescript
// ✅ Correct
import type { TUser } from '@scope/shared';
import { type TDoc, schema } from './schema';

// ❌ Wrong
import { TUser } from '@scope/shared';
```

### Unused Variables

Prefix with underscore to indicate intentionally unused:

```typescript
const [_value, setValue] = useState('');
function handler(_event: Event) { }
```

---

## Zod as Source of Truth

All TypeScript types are derived from Zod schemas. Never hand-write types that duplicate schema definitions:

```typescript
// ✅ Correct — derive from schema
export const schema = z.object({ name: z.string(), age: z.number() });
export type TDoc = z.infer<typeof schema>;

// ❌ Wrong — manual type that could drift
interface IDoc { name: string; age: number; }
```

---

## No Mongoose

The architecture uses the **native MongoDB driver** (`mongodb` package). No Mongoose models. Zod schemas are the source of truth for validation.

---

## `server-only` Guard

Every file in a `server/` directory MUST start with:

```typescript
import 'server-only';
```

Entity-level barrel exports (`_config.ts`) only re-export from `client/` and `api/` — **never** from `server/`.

---

## Component States

Every component that fetches data MUST handle all four states:

```tsx
function EntityList() {
  const { data, isLoading, error } = trpc.entity.getAll.useQuery();

  // 1. Loading state
  if (isLoading) return <Skeleton className="h-20 w-full" />;

  // 2. Error state
  if (error) return <Alert variant="destructive">{error.message}</Alert>;

  // 3. Empty state
  if (!data?.length) return <EmptyState message="No items yet" />;

  // 4. Success state
  return <div>{data.map(item => <EntityCard key={item.id} entity={item} />)}</div>;
}
```

---

## shadcn/ui Components — Always Use

Never use raw HTML elements when shadcn/ui has a component:

| Instead of | Use |
|-----------|-----|
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |
| `<select>` | `<Select>` |
| `<div class="card">` | `<Card>`, `<CardHeader>`, `<CardContent>` |
| `<table>` | `<Table>`, `<TableBody>`, `<TableRow>` |
| Loading spinners | `<Skeleton>` |
| Error banners | `<Alert variant="destructive">` |
| Modals | `<Dialog>` |
| Dropdowns | `<DropdownMenu>` |
| Tooltips | `<Tooltip>` |

---

## Mobile Patterns

### Pull-to-Refresh (Required)

Every mobile screen that fetches data MUST include pull-to-refresh:

```tsx
import { RefreshControl, ScrollView } from 'react-native';
import { useRefresh } from '@/hooks/use-refresh';

function MyScreen() {
  const { refreshing, onRefresh } = useRefresh();

  // ScrollView:
  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* content */}
    </ScrollView>
  );

  // OR FlatList (built-in props):
  return <FlatList refreshing={refreshing} onRefresh={onRefresh} data={items} />;
}
```

### Date Handling

- tRPC + superjson handles dates automatically
- API schemas must override `z.date()` fields to `z.string()`
- API adapter functions convert back with `new Date()`

---

## Query Invalidation

After mutations, always invalidate related queries:

```typescript
const utils = trpc.useUtils();

const mutation = trpc.entity.create.useMutation({
  onSuccess: async () => {
    await utils.entity.getAll.invalidate();
    await utils.stats.getDashboard.invalidate();
  },
});
```

---

## Database Schema Pattern

### Three-Tier Structure

Every entity follows:

```
schemas/database/[entity-name]/
├── _config.ts           # Root barrel export
├── index.ts             # Re-export _config
├── client/              # Frontend types (string IDs, Date objects)
├── api/                 # API types (string IDs, ISO string timestamps)
└── server/              # DB types (ObjectId, Date objects)
```

### Adapter Function Naming

| Function | Direction | Used When |
|----------|-----------|-----------|
| `adapterFnDbToFE` | Server → Client | After DB reads |
| `adapterFnFEToDbCreate` | Client → Server | Before inserts |
| `adapterFnFEToDbUpdate` | Client → Server | Before updates |
| `adapterFnApiToFE` | API → Client | In REST hooks |

---

## Shared Package Imports

```typescript
// ✅ Schema types from main entry
import type { TUser } from '@scope/shared';

// ✅ Constants via subpath
import { MY_CONSTANT } from '@scope/shared/constants/my-constants';

// ❌ Constants from main entry (build error!)
import { MY_CONSTANT } from '@scope/shared';
```

---

## User Identity Flow

1. `useUser()` from Clerk gives `clerkUser.id`
2. `trpc.user.getSingleWhere.useQuery({ clerkId })` fetches the app user record
3. `user.id` (MongoDB `_id` as string) becomes `ownerId` for all subsequent queries
4. The `useCurrentUser()` hook wraps this pattern

---

## Page Component Pattern

```typescript
'use client';

export default function EntityPage() {
  const { ownerId, isLoading: isUserLoading } = useCurrentUser();
  const { data, isLoading, error } = trpc.entity.getAll.useQuery(
    { ownerId: ownerId! },
    { enabled: !!ownerId }
  );

  if (isUserLoading || isLoading) return <PageSkeleton />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;
  if (!data?.length) return <EmptyState message="No items yet" />;

  return <EntityList items={data} />;
}
```

---

## Testing Patterns

- **Location:** Co-locate tests in `__tests__/` directories next to source files
- **Framework:** Vitest + @testing-library/react (jsdom)
- **Setup:** `apps/web/src/test/setup.ts` mocks Clerk, next/navigation, next/link
- **Queries:** Prefer `getByRole`, `getByText`, `getByLabelText` over `getByTestId`
- **Mocking constants:** When testing components that import from `@scope/shared/constants/*`, mock the constant module

---

## Formatting & Linting

### Prettier Config

```json
{
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss", "@ianvs/prettier-plugin-sort-imports"]
}
```

### ESLint Config

- Flat config (ESLint 9+)
- TypeScript-ESLint with type-aware rules
- React plugin (no prop-types, no react-in-jsx-scope)
- `_` prefix for intentionally unused variables

### Pre-Commit Hook

```bash
# .husky/pre-commit
pnpm lint-staged
pnpm turbo type-check
```

```javascript
// lint-staged.config.mjs
{
  '*.{js,jsx,ts,tsx,mjs,cjs}': ['eslint --no-warn-ignored --fix', 'prettier --write'],
  '*.css': ['prettier --write'],
}
```

---

## Verification

After making any changes, always run the full quality suite:

```bash
pnpm check  # lint → format:check → type-check → test:run
```
