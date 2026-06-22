#!/bin/bash
# verify-release-artifacts.sh — Validate DMG and GitHub release assets
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

echo "=== Verify Release Artifacts ==="

# Check DMG exists (from local build or CI)
DMG_DIR="$PROJECT_ROOT/src-tauri/target/release/bundle/dmg"
if [ -d "$DMG_DIR" ]; then
    DMG_COUNT=$(find "$DMG_DIR" -name "*.dmg" 2>/dev/null | wc -l)
    check "DMG directory exists" "true"
    if [ "$DMG_COUNT" -gt 0 ]; then
        check "DMG file present" "true"
        for dmg in "$DMG_DIR"/*.dmg; do
            SIZE=$(du -sh "$dmg" 2>/dev/null | cut -f1)
            echo "       DMG: $(basename "$dmg") ($SIZE)"
        done
    else
        check "DMG file present" "false"
    fi
else
    check "DMG directory exists" "false"
    echo "       (not yet built locally — run 'npx tauri build' or check CI artifacts)"
fi

# Check GitHub release (if tag exists and network available)
if command -v gh &>/dev/null; then
    REMOTE=$(git -C "$PROJECT_ROOT" remote get-url origin 2>/dev/null || echo "")
    TAG=$(git -C "$PROJECT_ROOT" describe --tags --abbrev=0 2>/dev/null || echo "")
    if [ -n "$TAG" ] && [ -n "$REMOTE" ]; then
        check "git tag exists" "true"
        echo "       tag: $TAG"
        # Check if release exists (may fail offline)
        if gh release view "$TAG" --repo Dreaminmaster/openalice-desktop &>/dev/null; then
            check "GitHub Release exists" "true"
            gh release view "$TAG" --repo Dreaminmaster/openalice-desktop --json assets,name --jq '.assets[] | "       Asset: \(.name)"' 2>/dev/null || true
        else
            check "GitHub Release exists" "false"
        fi
    else
        check "git tag exists" "false"
    fi
else
    echo "       gh CLI not available, skipping release check"
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] || exit 1
