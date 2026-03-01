#!/usr/bin/env bash
#
# Creates .env files from their .example templates.
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

echo ""
echo "Setting up environment files..."
echo ""

# 1. Root .env.local (powers the web app via symlink)
copy_env "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"

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
echo "  1. Open .env.local and fill in your service credentials (MongoDB, Clerk, etc.)"
echo "  2. Open apps/mobile/.env and set your LAN IP for EXPO_PUBLIC_API_URL"
echo "  3. Run: pnpm db:indexes"
echo ""
