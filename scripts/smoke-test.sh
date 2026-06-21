#!/bin/bash
# smoke-test.sh
# Quick sanity check that the build artifacts are valid

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Smoke Tests ==="
PASS=0
FAIL=0

check() {
    local name="$1"
    local condition="$2"
    if eval "$condition"; then
        echo "  ✅ $name"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $name"
        FAIL=$((FAIL + 1))
    fi
}

# Test 1: OpenAlice dist exists
check "OpenAlice dist directory" "[ -d '$PROJECT_ROOT/runtime/openalice-dist' ]"

# Test 2: Backend entry exists
check "Backend entry point (dist/main.js)" "[ -f '$PROJECT_ROOT/runtime/openalice-dist/dist/main.js' ]"

# Test 3: UI dist exists
check "UI dist directory" "[ -d '$PROJECT_ROOT/runtime/openalice-dist/ui/dist' ]"

# Test 4: Node runtime exists
check "Node.js runtime" "[ -f '$PROJECT_ROOT/runtime/node/bin/node' ]"

# Test 5: Tauri config exists
check "Tauri configuration" "[ -f '$PROJECT_ROOT/src-tauri/tauri.conf.json' ]"

# Test 6: Cargo.toml exists
check "Cargo configuration" "[ -f '$PROJECT_ROOT/src-tauri/Cargo.toml' ]"

# Test 7: Package.json exists
check "Frontend package.json" "[ -f '$PROJECT_ROOT/package.json' ]"

# Test 8: License files
check "LICENSE file" "[ -f '$PROJECT_ROOT/LICENSE' ]"
check "NOTICE file" "[ -f '$PROJECT_ROOT/NOTICE.md' ]"

# Test 9: Upstream commit recorded
check "OpenAlice commit recorded" "[ -f '$PROJECT_ROOT/OPENALICE_COMMIT' ]"

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    echo "Some tests failed. Check the output above."
    exit 1
fi

echo "All smoke tests passed!"
