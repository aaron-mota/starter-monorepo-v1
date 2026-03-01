# Starter Monorepo — Getting It Running

Step-by-step guide to get both web and mobile apps running locally from scratch.

---

## Phase 1: Prerequisites & Install

- [ ] Ensure Node.js >= 20 is installed (`node -v`)
- [ ] Ensure pnpm is installed (`corepack enable && corepack prepare pnpm@latest --activate`)
- [ ] Ensure Expo CLI is installed (`npm install -g eas-cli`)
- [ ] Run `pnpm install` from the repo root

## Phase 2: Create External Services

You need accounts for these services before the apps will work.

### MongoDB (Required)

- [ ] Create a free MongoDB Atlas cluster at https://cloud.mongodb.com
- [ ] Create a database user with read/write access
- [ ] Whitelist your IP (or use 0.0.0.0/0 for dev)
- [ ] Get the connection string (SRV format): `mongodb+srv://user:pass@cluster.mongodb.net/starter`
- [ ] Note your database name (e.g., `starter`)

### Clerk (Required)

- [ ] Create a Clerk application at https://clerk.com
- [ ] In the Clerk dashboard, go to **API Keys** and copy:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
  - `CLERK_SECRET_KEY` (starts with `sk_test_`)
- [ ] Go to **Webhooks** → create an endpoint pointing to `http://localhost:3000/api/webhook/clerk`
  - Subscribe to `user.created` and `user.deleted` events
  - Copy the webhook signing secret as `CLERK_WEBHOOK_SECRET`
  - (For local dev, use a tunnel like ngrok: `ngrok http 3000`, then use the ngrok URL for the webhook endpoint)
- [ ] The same Clerk publishable key works for both web and mobile

### Stripe (Optional — for payments)

- [ ] Create a Stripe account at https://stripe.com
- [ ] Get test mode keys from the **Developers** → **API keys** page:
  - `STRIPE_SECRET_KEY` (starts with `sk_test_`)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
- [ ] Create a webhook endpoint at **Developers** → **Webhooks** pointing to `http://localhost:3000/api/webhook/stripe`
  - Subscribe to: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
  - Copy the signing secret as `STRIPE_WEBHOOK_SECRET`
- [ ] Create at least one product + price for the "Pro" plan

### Resend (Optional — for email)

- [ ] Create a Resend account at https://resend.com
- [ ] Get your API key as `RESEND_API_KEY`
- [ ] (For production, verify your sending domain)

### Push Notifications (Optional)

- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`
- [ ] Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## Phase 3: Create Environment Files

### Root `.env.local` (powers the web app)

- [ ] Copy the example: `cp .env.example .env.local`
- [ ] Fill in all values from Phase 2:

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/starter
MONGODB_DB=starter
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (leave blank or omit if not using)
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
CRON_SECRET=any-random-string
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
```

### Web app symlink

- [ ] Create a symlink so Next.js picks up the root env file:
  ```bash
  ln -s ../../.env.local apps/web/.env.local
  ```

### Mobile `apps/mobile/.env`

- [ ] Create `apps/mobile/.env` with:

```env
# For local dev, use your machine's LAN IP (not localhost!)
# Find it with: ipconfig getifaddr en0
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000

# Same Clerk key as the web app
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

> **Important:** Mobile can't reach `localhost` — use your machine's LAN IP (e.g., `http://192.168.1.42:3000`). Find it with `ipconfig getifaddr en0`.

## Phase 4: Database Setup

- [ ] Run `pnpm db:indexes` to create MongoDB indexes
  ```bash
  pnpm db:indexes
  ```
- [ ] Verify no errors — this creates indexes for User, Item, CompanyUser, DeviceRegistration, SubscriptionUser collections

## Phase 5: Run the Web App

- [ ] Start the dev server:
  ```bash
  pnpm dev
  ```
  This starts Next.js with Turbopack at http://localhost:3000

- [ ] **Verify these work:**
  - [ ] Landing page loads at http://localhost:3000
  - [ ] Sign-up flow works (creates a Clerk user)
  - [ ] After sign-up, you're redirected to `/dashboard`
  - [ ] Dashboard loads without errors
  - [ ] Settings page shows your account info

> **Troubleshooting:**
> - "User not found" after sign-up → Clerk webhook isn't firing. Either set up ngrok + webhook, or manually create the user doc in MongoDB.
> - Build errors about `@starter/*` → Run `pnpm install` again from the root.
> - Type errors → Run `pnpm type-check` to see all issues.

## Phase 6: Run the Mobile App

The mobile app uses `expo-dev-client` (native modules like `expo-secure-store` and `expo-notifications`), so it **cannot run in Expo Go**. You need a development build.

### Option A: iOS Simulator Build (fastest for testing)

- [ ] Install EAS CLI if not already: `npm install -g eas-cli`
- [ ] Log in to Expo: `eas login`
- [ ] Initialize EAS in the mobile app:
  ```bash
  cd apps/mobile
  eas init
  ```
  This generates a real `projectId` — update it in `app.json` under `extra.eas.projectId`

- [ ] Build for iOS simulator:
  ```bash
  eas build --profile development --platform ios
  ```
  (This builds in the cloud — takes ~10–15 min the first time)

- [ ] Once the build finishes, download and install the `.tar.gz` on your simulator:
  ```bash
  # EAS CLI will prompt you to install automatically
  ```

- [ ] Start the Expo dev server:
  ```bash
  cd apps/mobile
  npx expo start --dev-client
  ```

- [ ] Open the app on the simulator — it should connect to the dev server

### Option B: Physical Device Build (for real device testing)

- [ ] Build for physical device:
  ```bash
  cd apps/mobile
  eas build --profile development-device --platform ios
  ```

- [ ] Install the build on your device via QR code from the EAS dashboard

- [ ] Start the dev server:
  ```bash
  cd apps/mobile
  npx expo start --dev-client
  ```

- [ ] Scan the QR code with your device camera to connect

### Verify Mobile App

- [ ] **Make sure the web server is running** (`pnpm dev` from root) — the mobile app hits the web API
- [ ] Sign in with the same Clerk account as web
- [ ] Dashboard tab loads with data
- [ ] Items tab shows your items (if any)
- [ ] Settings tab shows your account
- [ ] Pull-to-refresh works on all screens

> **Troubleshooting:**
> - "Network request failed" → Check `EXPO_PUBLIC_API_URL` uses your LAN IP, not `localhost`. Ensure web server is running.
> - Auth errors → Ensure `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` matches the web app's key.
> - Build fails → Run `eas build` from inside `apps/mobile/`, not the repo root.

## Phase 7: Quality Check

- [ ] Run the full quality suite from the repo root:
  ```bash
  pnpm check
  ```
  This runs: lint → format:check → type-check → test:run

- [ ] Fix any issues that come up (most likely import path issues or missing type exports)

## Phase 8: Customize for Your Project

Once everything runs, start making it yours:

- [ ] Rename `@starter/*` packages to `@yourproject/*` across all package.json files and imports
- [ ] Update app branding (name, icons, colors in globals.css)
- [ ] Replace the example `Item` entity with your domain entities
- [ ] Add your pages and components
- [ ] See `docs/starter-setup-guide.md` for the full customization guide

---

## Quick Reference: Key Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start all dev servers (web + turbo) |
| `pnpm build` | Build all packages and apps |
| `pnpm check` | Full quality suite (lint + format + types + tests) |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Auto-format code |
| `pnpm test:run` | Run tests once |
| `pnpm db:indexes` | Create MongoDB indexes |
| `cd apps/mobile && npx expo start --dev-client` | Start mobile dev server |
| `cd apps/mobile && eas build --profile development --platform ios` | Build for iOS simulator |

## File Locations: Environment

| File | Purpose | Git-tracked? |
|------|---------|-------------|
| `.env.example` | Template with all env var names | Yes |
| `.env.local` | Root env file (web app reads via symlink) | No (.gitignored) |
| `apps/web/.env.local` | Symlink → `../../.env.local` | No (.gitignored) |
| `apps/mobile/.env` | Mobile-specific env vars | No (.gitignored) |
| `apps/mobile/.env.example` | Mobile env template | Yes |
