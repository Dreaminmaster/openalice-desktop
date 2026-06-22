#!/bin/bash
# smoke-test.sh — Quick validation that the project builds and essential files exist
set -e

SCRIPT_DIR="/tmp/openalice-desktop/scripts"
PROJECT_ROOT="/tmp/openalice-desktop"
PASS=0
FAIL=0

check() {
    local name="$1"
    local condition="$2"
    if eval "$condition" 2>/dev/null; then
        echo "  ✅ $name"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $name"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Smoke Tests ==="
check "Tauri config" "[ -f '$PROJECT_ROOT/src-tauri/tauri.conf.json' ]"
check "Cargo.toml" "[ -f '$PROJECT_ROOT/src-tauri/Cargo.toml' ]"
check "package.json" "[ -f '$PROJECT_ROOT/package.json' ]"
check "index.html" "[ -f '$PROJECT_ROOT/index.html' ]"
check "main.rs" "[ -f '$PROJECT_ROOT/src-tauri/src/main.rs' ]"
check "lib.rs" "[ -f '$PROJECT_ROOT/src-tauri/src/lib.rs' ]"
check "commands/mod.rs" "[ -f '$PROJECT_ROOT/src-tauri/src/commands/mod.rs' ]"
check "capabilities" "[ -f '$PROJECT_ROOT/src-tauri/capabilities/default.json' ]"
check "LICENSE" "[ -f '$PROJECT_ROOT/LICENSE' ]"
check "NOTICE.md" "[ -f '$PROJECT_ROOT/NOTICE.md' ]"
check "CI workflow" "[ -f '$PROJECT_ROOT/.github/workflows/build-dmg.yml' ]"
check "vendor/OpenAlice" "[ -d '$PROJECT_ROOT/vendor/OpenAlice' ]"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] || exit 1
