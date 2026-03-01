# Starter Monorepo — Setup Guide

> How to use this template to bootstrap a new full-stack web + mobile application.

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** 9.15+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **MongoDB** (Atlas recommended, or local instance)
- **Clerk** account (https://clerk.com)
- **Stripe** account (for payments, optional)
- **Resend** account (for emails, optional)
- **Expo CLI** (`npm install -g eas-cli`, for mobile builds)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url> my-app
cd my-app
pnpm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# Required
MONGODB_URI=mongodb+srv://...
MONGODB_DB=myapp
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (for webhooks)
CLERK_WEBHOOK_SECRET=whsec_...

# Optional (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional (for email)
RESEND_API_KEY=re_...

# Optional (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Optional (for cron jobs)
CRON_SECRET=your-random-secret
```

### 3. Database Setup

```bash
pnpm db:setup  # Creates indexes + seeds sample data (if applicable)
```

### 4. Start Development

```bash
pnpm dev  # Starts all dev servers
```

- **Web:** http://localhost:3000
- **Mobile:** Expo dev server (scan QR code or open in simulator)

---

## Customizing for Your Project

### Step 1: Rename Packages

Update package names across the monorepo:

1. **Root `package.json`** — Change `"name"` field
2. **Each `packages/*/package.json`** — Change `"name"` from `@starter/*` to `@yourscope/*`
3. **Each `apps/*/package.json`** — Change `"name"` and update dependency references
4. **`turbo.json`** — No changes needed (uses workspace references)
5. **`pnpm-workspace.yaml`** — No changes needed (glob patterns)

Example renames:
```
@starter/shared  → @myapp/shared
@starter/db      → @myapp/db
@starter/trpc    → @myapp/trpc
@starter/api     → @myapp/api
@starter/ui      → @myapp/ui
@starter/web     → @myapp/web
@starter/mobile  → @myapp/mobile
```

After renaming, update all imports:
```bash
# Find and replace across the codebase
grep -r "@starter/" --include="*.ts" --include="*.tsx" --include="*.json" -l
```

### Step 2: Define Your Entities

The template includes example entities. Replace them with your domain entities:

1. **Create schema folder:**
   ```
   packages/shared/schemas/database/your-entity/
   ```
   Copy from `_template/` and customize.

2. **Define fields in `client/schema.ts`:**
   ```typescript
   export const schema = schemaDatabaseObject.extend({
     name: z.string().min(1).max(100),
     description: z.string().optional(),
     ownerId: z.string(),
     // ... your fields
   });

   export const schemaCreate = schema.omit({
     id: true,
     createdAt: true,
     updatedAt: true,
   });

   export const schemaUpdate = schemaCreate.partial();
   ```

3. **Add collection accessor** in `packages/db/src/collections.ts`
4. **Add indexes** in `packages/db/src/indexes.ts`
5. **Create tRPC router** in `packages/trpc/src/routers/your-entity/`
6. **Register in app router** in `packages/trpc/src/routers/_app.ts`

### Step 3: Update Web App

1. **Pages:** Add/modify pages in `apps/web/src/app/(dashboard)/`
2. **Components:** Create entity-specific components in `apps/web/src/components/`
3. **Navigation:** Update sidebar in `apps/web/src/components/layout/sidebar-nav.tsx`

### Step 4: Update Mobile App

1. **Screens:** Add/modify screens in `apps/mobile/app/(tabs)/`
2. **Components:** Create native components in `apps/mobile/components/`
3. **Tab config:** Update tab layout in `apps/mobile/app/(tabs)/_layout.tsx`

### Step 5: Configure Services

1. **Clerk:** Set up your sign-in/sign-up flow, configure webhooks
2. **Stripe:** Create products/prices, configure webhook endpoint
3. **Resend:** Verify domain, configure email templates
4. **Push:** Generate VAPID keys for web push

---

## Project Structure After Customization

```
my-app/
├── apps/
│   ├── web/                    # Your Next.js web app
│   └── mobile/                 # Your Expo mobile app
├── packages/
│   ├── shared/                 # Your schemas, types, constants
│   │   ├── schemas/database/
│   │   │   ├── user/           # (keep) User entity
│   │   │   ├── your-entity/    # (add) Your domain entities
│   │   │   └── _template/      # (reference) Template for new entities
│   │   └── constants/          # Your app constants
│   ├── db/                     # MongoDB layer (mostly unchanged)
│   ├── trpc/                   # tRPC routers (add yours, remove examples)
│   ├── api/                    # REST API hooks (if needed)
│   └── ui/                     # Shared UI (build out as needed)
├── docs/                       # Your documentation
└── (config files)              # Mostly unchanged
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all packages and apps |
| `pnpm check` | Full quality suite (lint + format + type-check + tests) |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Auto-format code |
| `pnpm test:run` | Run tests once |
| `pnpm db:indexes` | Create MongoDB indexes |
| `pnpm db:setup` | Create indexes + seed data |

---

## Deployment

### Web (Vercel)

1. Connect your GitHub repo to Vercel
2. Set the root directory to `apps/web`
3. Set build command: `cd ../.. && pnpm turbo build --filter=@yourscope/web...`
4. Set install command: `cd ../.. && pnpm install`
5. Add environment variables in Vercel dashboard

### Mobile (EAS)

```bash
cd apps/mobile

# Login to Expo
eas login

# Configure project
eas init

# Development build (device testing)
eas build --profile development-device --platform ios

# Production build
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

---

## Adding a New Entity — Complete Checklist

- [ ] Create `packages/shared/schemas/database/[entity]/` with all three tiers
- [ ] Add `_config.ts` with TYPE definition (router name, collection name, display)
- [ ] Add collection accessor to `packages/db/src/collections.ts`
- [ ] Add indexes to `packages/db/src/indexes.ts`
- [ ] Create router at `packages/trpc/src/routers/[entity]/`
- [ ] Register router in `packages/trpc/src/routers/_app.ts`
- [ ] (Optional) Create API router at `packages/api/src/routers/database/[entity]/`
- [ ] (Optional) Register in `packages/api/src/api.ts`
- [ ] Create web page at `apps/web/src/app/(dashboard)/[entity]/page.tsx`
- [ ] Create web components at `apps/web/src/components/[entity]/`
- [ ] Create mobile screen at `apps/mobile/app/(tabs)/([entity])/`
- [ ] Add navigation link to sidebar/tabs
- [ ] Add tests
- [ ] Run `pnpm check` to verify everything passes
