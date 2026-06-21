#!/bin/bash
# fetch-openalice.sh
# Download or update the upstream OpenAlice repo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VENDOR_DIR="$PROJECT_ROOT/vendor/OpenAlice"

echo "=== Fetch OpenAlice Upstream ==="

if [ -f "$VENDOR_DIR/package.json" ]; then
    echo "OpenAlice already cloned, updating..."
    cd "$VENDOR_DIR"
    git fetch origin 2>/dev/null || true
    git checkout master 2>/dev/null || true
else
    echo "Cloning OpenAlice..."
    rm -rf "$VENDOR_DIR"
    mkdir -p "$PROJECT_ROOT/vendor"
    git clone --depth 1 https://github.com/TraderAlice/OpenAlice.git "$VENDOR_DIR"
fi

# Record commit hash
COMMIT_HASH=$(cd "$VENDOR_DIR" && git rev-parse HEAD)
echo "$COMMIT_HASH" > "$PROJECT_ROOT/OPENALICE_COMMIT"
echo "Bundled OpenAlice commit: $COMMIT_HASH"
echo "Done."
