#!/bin/bash
# verify-runtime-commands.sh — Validate that all Tauri commands are registered in Rust source
set -e

PROJECT_ROOT="/tmp/openalice-desktop"
COMMANDS_RS="$PROJECT_ROOT/src-tauri/src/commands/mod.rs"
LIB_RS="$PROJECT_ROOT/src-tauri/src/lib.rs"

PASS=0
FAIL=0

check_command() {
    local name="$1"
    if grep -q "$name" "$LIB_RS" 2>/dev/null; then
        echo "  ✅ $name"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $name (not found in lib.rs)"
        FAIL=$((FAIL + 1))
    fi
}

check_fn() {
    local name="$1"
    if grep -q "fn $name" "$COMMANDS_RS" 2>/dev/null; then
        echo "  ✅ fn $name"
        PASS=$((PASS + 1))
    else
        echo "  ❌ fn $name (not found in commands/mod.rs)"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Verify Runtime Commands ==="

echo "Registered Tauri commands:"
check_command "get_app_status"
check_command "init_app_dirs"
check_command "check_system_dependencies"
check_command "check_ports"
check_command "start_openalice"
check_command "stop_openalice"
check_command "restart_openalice"
check_command "get_process_status"
check_command "tail_openalice_logs"
check_command "save_config"
check_command "load_config"
check_command "export_diagnostics"
check_command "get_openalice_info"
check_command "clone_openalice"
check_command "install_openalice_deps"
check_command "build_openalice"
check_command "open_web_ui"
check_command "reveal_runtime_folder"

echo ""
echo "Rust function implementations:"
check_fn "get_app_status"
check_fn "init_app_dirs"
check_fn "check_system_dependencies"
check_fn "check_ports"
check_fn "start_openalice"
check_fn "stop_openalice"
check_fn "restart_openalice"
check_fn "get_process_status"
check_fn "tail_openalice_logs"
check_fn "save_config"
check_fn "load_config"
check_fn "export_diagnostics"
check_fn "get_openalice_info"
check_fn "clone_openalice"
check_fn "install_openalice_deps"
check_fn "build_openalice"
check_fn "open_web_ui"
check_fn "reveal_runtime_folder"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] || exit 1
