#!/bin/bash
# build-openalice.sh
# Build OpenAlice production assets and copy to runtime/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VENDOR_DIR="$PROJECT_ROOT/vendor/OpenAlice"
RUNTIME_DIR="$PROJECT_ROOT/runtime/openalice-dist"

echo "=== Build OpenAlice ==="

if [ ! -d "$VENDOR_DIR" ]; then
    echo "ERROR: OpenAlice not found at $VENDOR_DIR"
    echo "Run: ./scripts/fetch-openalice.sh"
    exit 1
fi

cd "$VENDOR_DIR"

# Enable corepack for pnpm
corepack enable

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile || pnpm install

# Build
echo "Building..."
pnpm build

# Copy build artifacts
echo "Copying artifacts to runtime..."
mkdir -p "$RUNTIME_DIR"
rm -rf "$RUNTIME_DIR/dist" "$RUNTIME_DIR/ui/dist" "$RUNTIME_DIR/package.json"

# Copy dist
cp -r "$VENDOR_DIR/dist" "$RUNTIME_DIR/" 2>/dev/null || true
cp -r "$VENDOR_DIR/ui/dist" "$RUNTIME_DIR/" 2>/dev/null || true
cp "$VENDOR_DIR/package.json" "$RUNTIME_DIR/" 2>/dev/null || true

# Copy essential configs
cp "$VENDOR_DIR/.npmrc" "$RUNTIME_DIR/" 2>/dev/null || true

echo "Build complete. Artifacts in: $RUNTIME_DIR"
ls -la "$RUNTIME_DIR/"

echo "Done."
