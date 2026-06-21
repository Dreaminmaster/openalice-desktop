#!/bin/bash
# make-diagnostic-bundle.sh
# Create a tar.gz bundle of logs and diagnostics for debugging

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOME_DIR="${HOME:-$(eval echo ~$USER)}"
LOG_DIR="$HOME_DIR/.openalice-desktop/logs"
BACKUP_DIR="$HOME_DIR/.openalice-desktop/backups"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BUNDLE_NAME="openalice-diagnostic-$TIMESTAMP.tar.gz"
TEMP_DIR=$(mktemp -d)

echo "=== Creating Diagnostic Bundle ==="

# Copy logs
mkdir -p "$TEMP_DIR/logs"
if [ -d "$LOG_DIR" ]; then
    cp -r "$LOG_DIR"/* "$TEMP_DIR/logs/" 2>/dev/null || true
else
    echo "No logs directory found at $LOG_DIR"
fi

# Copy config (redact sensitive data)
mkdir -p "$TEMP_DIR/config"
CONFIG_FILE="$HOME_DIR/.openalice-desktop/config.json"
if [ -f "$CONFIG_FILE" ]; then
    # Redact API keys and secrets
    sed -E 's/(api_key|secret|token|password)["\s:=]+[^",\n}]*/\1: "***REDACTED***"/gi' "$CONFIG_FILE" > "$TEMP_DIR/config/config.json"
else
    echo "No config file found"
fi

# System info
echo "=== System Information ===" > "$TEMP_DIR/system-info.txt"
echo "Hostname: $(hostname)" >> "$TEMP_DIR/system-info.txt"
echo "OS: $(sw_vers -productVersion 2>/dev/null || uname -a)" >> "$TEMP_DIR/system-info.txt"
echo "Arch: $(uname -m)" >> "$TEMP_DIR/system-info.txt"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$TEMP_DIR/system-info.txt"

# OpenAlice commit
if [ -f "$PROJECT_ROOT/OPENALICE_COMMIT" ]; then
    echo "OpenAlice commit: $(cat "$PROJECT_ROOT/OPENALICE_COMMIT")" >> "$TEMP_DIR/system-info.txt"
fi
if [ -f "$PROJECT_ROOT/src-tauri/tauri.conf.json" ]; then
    DESKTOP_VER=$(grep '"version"' "$PROJECT_ROOT/src-tauri/tauri.conf.json" | head -1 | sed 's/.*: "\(.*\)".*/\1/')
    echo "Desktop version: $DESKTOP_VER" >> "$TEMP_DIR/system-info.txt"
fi

# Create bundle
cd "$TEMP_DIR"
tar czf "$BACKUP_DIR/$BUNDLE_NAME" . 2>/dev/null || \
    tar czf "$PROJECT_ROOT/$BUNDLE_NAME" .

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Bundle created: $BACKUP_DIR/$BUNDLE_NAME"
echo "Send this file to developers for debugging."
