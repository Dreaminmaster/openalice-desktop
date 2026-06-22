#!/bin/bash
# build-dmg.sh
# Build the Tauri DMG package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Build OpenAlice Desktop DMG ==="

# Ensure runtime is prepared
if [ ! -f "$PROJECT_ROOT/runtime/openalice-dist/dist/main.js" ]; then
    echo "Preparing runtime..."
    "$SCRIPT_DIR/prepare-runtime.sh"
fi

# Install dependencies
echo "Installing project dependencies..."
cd "$PROJECT_ROOT"
pnpm install

# Build Tauri app
echo "Building Tauri app..."
pnpm tauri build

# Find the built DMG
DMG_PATH=$(find "$PROJECT_ROOT/src-tauri/target/release/bundle/dmg/" -name "*.dmg" 2>/dev/null | head -1)

if [ -n "$DMG_PATH" ]; then
    DMG_SIZE=$(du -sh "$DMG_PATH" | cut -f1)
    echo ""
    echo "=== Build Complete ==="
    echo "DMG: $DMG_PATH"
    echo "Size: $DMG_SIZE"
    echo ""
    echo "To install: Double-click the DMG and drag to Applications"
else
    echo "WARNING: DMG not found. Build may have failed."
    echo "Check: $PROJECT_ROOT/src-tauri/target/release/bundle/"
fi

echo "Done."
