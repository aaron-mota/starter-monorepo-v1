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

#### Local webhook tunnel (required for Clerk webhooks)

Clerk needs to reach your local machine to deliver webhook events (e.g., `user.created`). Run an ngrok tunnel **before** setting up the webhook in Clerk:

```bash
ngrok http 3000
```

Copy the forwarding URL (e.g., `https://abc123.ngrok-free.app`) — you'll use it in the next step.

> **Tip:** Keep this terminal running while developing. If you restart ngrok you'll get a new URL and will need to update the webhook endpoint in Clerk.

- [ ] Go to **Webhooks** → create an endpoint pointing to `https://YOUR_NGROK_URL/api/webhook/clerk`
  - Subscribe to `user.created` and `user.deleted` events
  - Copy the webhook signing secret as `CLERK_WEBHOOK_SECRET`
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

Run the setup script to create all env files at once:

```bash
./scripts/setup-env.sh
```

This copies the `.example` templates and creates the web app symlink:

| Source | Destination | Purpose |
|--------|-------------|---------|
| `.env.example` | `.env.local` | Web app config (all services) |
| `apps/mobile/.env.example` | `apps/mobile/.env` | Mobile app config |
| — | `apps/web/.env.local` → `../../.env.local` | Symlink so Next.js reads root env |

> Re-run with `--force` to overwrite existing files: `./scripts/setup-env.sh --force`

### Fill in your credentials

- [ ] Open `.env.local` and fill in all values from Phase 2:

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

- [ ] Open `apps/mobile/.env` and set your LAN IP:

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

You have two options for running the mobile app locally. Both support hot reload for JS/TS changes — the difference is native module support.

| | Expo Go | Development Build |
|---|---|---|
| **Setup time** | Instant (download from App Store) | ~10–15 min (one-time EAS cloud build) |
| **Hot reload** | Yes | Yes |
| **Push notifications** | No (silently skipped) | Yes |
| **When to rebuild** | Never | Only when adding native modules or changing `app.json` plugins |

**Recommendation:** Start with Expo Go to get running fast. Switch to a development build when you need push notifications or add a custom native module.

### Option A: Expo Go (fastest start)

Expo Go is a pre-built app from the App Store / Play Store that can run your project with no native build step.

- [ ] Install **Expo Go** on your physical device (App Store / Google Play) or use the iOS Simulator (Expo Go is pre-installed)
- [ ] Start the Expo dev server:
  ```bash
  cd apps/mobile
  npx expo start --go
  ```
  > The `--go` flag is required because `expo-dev-client` is in the project dependencies, which makes `npx expo start` default to development build mode. Alternatively, you can run `npx expo start` and press `s` to switch to Expo Go.
- [ ] **Physical device:** Scan the QR code in the terminal with your device camera
- [ ] **iOS Simulator:** Press `i` in the terminal to open in the simulator

> **Limitation:** Push notification registration will silently fail in Expo Go (the code is wrapped in a try/catch). Everything else — auth, data fetching, navigation, haptics — works normally.

### Option B: Development Build (full features)

A development build is a custom native app compiled with all your native modules. Once built, you use it exactly like Expo Go — hot reload works the same way. You only need to rebuild when adding a new native module or changing `app.json` plugins.

- [ ] Install EAS CLI if not already: `npm install -g eas-cli`
- [ ] Log in to Expo: `eas login`
- [ ] Initialize EAS in the mobile app:
  ```bash
  cd apps/mobile
  eas init
  ```
  This generates a real `projectId` — update it in `app.json` under `extra.eas.projectId`

#### iOS Simulator

- [ ] Build for iOS simulator:
  ```bash
  cd apps/mobile
  eas build --profile development --platform ios
  ```
  (Builds in the cloud — ~10–15 min the first time. Subsequent builds with no native changes are cached.)

- [ ] Once the build finishes, EAS CLI will prompt you to install it on the simulator automatically

- [ ] Start the Expo dev server:
  ```bash
  cd apps/mobile
  npx expo start --dev-client
  ```

- [ ] Open the app on the simulator — it should connect to the dev server

#### Physical Device

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
> - Expo Go crashes on launch → Make sure you're using `npx expo start` (not `--dev-client`). The `--dev-client` flag is only for development builds.

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
| `cd apps/mobile && npx expo start --go` | Start mobile dev server (Expo Go) |
| `cd apps/mobile && npx expo start --dev-client` | Start mobile dev server (development build) |
| `cd apps/mobile && eas build --profile development --platform ios` | Build dev client for iOS simulator |

## File Locations: Environment

| File | Purpose | Git-tracked? |
|------|---------|-------------|
| `.env.example` | Template with all env var names | Yes |
| `.env.local` | Root env file (web app reads via symlink) | No (.gitignored) |
| `apps/web/.env.local` | Symlink → `../../.env.local` | No (.gitignored) |
| `apps/mobile/.env` | Mobile-specific env vars | No (.gitignored) |
| `apps/mobile/.env.example` | Mobile env template | Yes |
