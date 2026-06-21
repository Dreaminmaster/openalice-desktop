#!/bin/bash
# smoke-test.sh
# Quick sanity check that essential files exist
# Note: OpenAlice build artifacts are verified by the build step itself

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

# Core project files
check "Tauri config" "[ -f '$PROJECT_ROOT/src-tauri/tauri.conf.json' ]"
check "Cargo.toml" "[ -f '$PROJECT_ROOT/src-tauri/Cargo.toml' ]"
check "Frontend package.json" "[ -f '$PROJECT_ROOT/package.json' ]"
check "LICENSE" "[ -f '$PROJECT_ROOT/LICENSE' ]"
check "NOTICE.md" "[ -f '$PROJECT_ROOT/NOTICE.md' ]"
check "THIRD_PARTY_NOTICES.md" "[ -f '$PROJECT_ROOT/THIRD_PARTY_NOTICES.md' ]"
check "CI workflow" "[ -f '$PROJECT_ROOT/.github/workflows/build-dmg.yml' ]"
check "OpenAlice commit recorded" "[ -f '$PROJECT_ROOT/OPENALICE_COMMIT' ]"

# OpenAlice submodule exists
check "OpenAlice submodule" "[ -d '$PROJECT_ROOT/vendor/OpenAlice' ]"
check "OpenAlice package.json" "[ -f '$PROJECT_ROOT/vendor/OpenAlice/package.json' ]"

# Scripts exist and are executable
check "fetch-openalice.sh" "[ -x '$PROJECT_ROOT/scripts/fetch-openalice.sh' ]"
check "build-openalice.sh" "[ -x '$PROJECT_ROOT/scripts/build-openalice.sh' ]"
check "build-dmg.sh" "[ -x '$PROJECT_ROOT/scripts/build-dmg.sh' ]"

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    echo "Some tests failed."
    exit 1
fi

echo "All smoke tests passed!"
