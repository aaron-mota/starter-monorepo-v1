#!/usr/bin/env bash
#
# Creates .env files from their .example templates and generates
# placeholder secrets so the apps can start without manual setup.
#
# Safe to run multiple times — existing files are never overwritten.
#
# Usage:
#   ./scripts/setup-env.sh          # normal run
#   ./scripts/setup-env.sh --force  # overwrite existing files

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FORCE=false

if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

copy_env() {
  local src="$1"
  local dest="$2"

  if [[ ! -f "$src" ]]; then
    echo "  ⚠  Source not found: $src (skipping)"
    return
  fi

  if [[ -f "$dest" && "$FORCE" == false ]]; then
    echo "  ✓  Already exists: $dest (skipping)"
    return
  fi

  cp "$src" "$dest"
  echo "  ✓  Created: $dest"
}

generate_secret() {
  # Generate a random 32-byte hex string for secrets
  if command -v openssl &>/dev/null; then
    openssl rand -hex 32
  else
    LC_ALL=C tr -dc 'a-f0-9' </dev/urandom | head -c 64
  fi
}

echo ""
echo "Setting up environment files..."
echo ""

# 1. Root .env.local (powers the web app via symlink)
copy_env "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"

# Fill in generated secrets
if [[ -f "$ROOT_DIR/.env.local" ]]; then
  CRON_SECRET="$(generate_secret)"

  if grep -q "CRON_SECRET=replace-me" "$ROOT_DIR/.env.local"; then
    if [[ "$OSTYPE" == darwin* ]]; then
      sed -i '' "s/CRON_SECRET=replace-me/CRON_SECRET=${CRON_SECRET}/" "$ROOT_DIR/.env.local"
    else
      sed -i "s/CRON_SECRET=replace-me/CRON_SECRET=${CRON_SECRET}/" "$ROOT_DIR/.env.local"
    fi
    echo "  ✓  Generated CRON_SECRET"
  fi
fi

# 2. Mobile .env
copy_env "$ROOT_DIR/apps/mobile/.env.example" "$ROOT_DIR/apps/mobile/.env"

# 3. Symlink so Next.js reads the root .env.local
SYMLINK="$ROOT_DIR/apps/web/.env.local"
if [[ -L "$SYMLINK" || -f "$SYMLINK" ]]; then
  if [[ "$FORCE" == false ]]; then
    echo "  ✓  Already exists: apps/web/.env.local (skipping)"
  else
    rm -f "$SYMLINK"
    ln -s ../../.env.local "$SYMLINK"
    echo "  ✓  Created symlink: apps/web/.env.local → ../../.env.local"
  fi
else
  ln -s ../../.env.local "$SYMLINK"
  echo "  ✓  Created symlink: apps/web/.env.local → ../../.env.local"
fi

echo ""
echo "Done! Next steps:"
echo ""
echo "  1. Get your Clerk keys from https://dashboard.clerk.com → API Keys"
echo "     - Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local"
echo "     - Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/mobile/.env"
echo ""
echo "  2. Set up MongoDB (local or Atlas) and update MONGODB_URI in .env.local"
echo ""
echo "  3. (Optional) For physical-device testing, update EXPO_PUBLIC_API_URL"
echo "     in apps/mobile/.env to your LAN IP (e.g. http://192.168.1.100:3000)"
echo ""
echo "  4. Run: pnpm db:indexes"
echo ""
