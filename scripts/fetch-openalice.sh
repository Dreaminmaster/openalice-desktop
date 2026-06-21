#!/bin/bash
# fetch-openalice.sh
# Download and record the upstream OpenAlice commit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VENDOR_DIR="$PROJECT_ROOT/vendor/OpenAlice"

echo "=== Fetch OpenAlice Upstream ==="

if [ -d "$VENDOR_DIR/.git" ]; then
    echo "OpenAlice submodule already exists, updating..."
    cd "$VENDOR_DIR"
    git fetch origin
    git checkout master
else
    echo "Cloning OpenAlice..."
    mkdir -p "$PROJECT_ROOT/vendor"
    git clone --depth 1 https://github.com/TraderAlice/OpenAlice.git "$VENDOR_DIR"
fi

# Record commit hash
COMMIT_HASH=$(cd "$VENDOR_DIR" && git rev-parse HEAD)
echo "$COMMIT_HASH" > "$PROJECT_ROOT/OPENALICE_COMMIT"
echo "Bundled OpenAlice commit: $COMMIT_HASH"

echo "Done."
