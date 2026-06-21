# Build Guide

## Prerequisites

- macOS 13+ (Ventura)
- Apple Silicon (M1/M2/M3/M4) or Intel (x86_64)
- Xcode Command Line Tools
- Git
- Node.js 20+ (for development only)
- pnpm (via corepack)
- Rust toolchain (for Tauri builds)

## Quick Start

```bash
# 1. Clone with submodules
git clone --recurse-submodules https://github.com/Dreaminmaster/openalice-desktop.git
cd openalice-desktop

# 2. Fetch upstream OpenAlice
./scripts/fetch-openalice.sh

# 3. Prepare runtime (Node.js + build OpenAlice)
./scripts/prepare-runtime.sh

# 4. Install dependencies
pnpm install

# 5. Development mode
pnpm tauri dev

# 6. Build DMG
pnpm tauri build
```

## Build Steps Explained

### Step 1: Fetch OpenAlice

```bash
./scripts/fetch-openalice.sh
```

Clones `TraderAlice/OpenAlice` into `vendor/OpenAlice/` and records the commit hash in `OPENALICE_COMMIT`.

### Step 2: Build OpenAlice

```bash
./scripts/build-openalice.sh
```

Runs `pnpm install && pnpm build` in the OpenAlice vendor directory, then copies the production artifacts to `runtime/openalice-dist/`.

### Step 3: Prepare Runtime

```bash
./scripts/prepare-runtime.sh
```

Downloads the correct Node.js binary for your architecture (arm64 or x86_64) into `runtime/node/`.

### Step 4: Build Tauri App

```bash
pnpm tauri build
```

Compiles the Rust backend and bundles the React frontend into a macOS DMG.

## Architecture-Specific Builds

Build arm64 DMG on Apple Silicon Mac:
```bash
# Already the default on M-series Macs
pnpm tauri build
```

Build x64 DMG on Intel Mac:
```bash
# Default on Intel Macs
pnpm tauri build
```

## Troubleshooting

### node-pty architecture mismatch

If you see "bad CPU type" errors:
- Make sure you build on the same architecture you're distributing
- Don't cross-compile arm64 on x64 or vice versa

### Tauri build fails

```bash
# Reinstall Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Reinstall Tauri CLI
cargo install tauri-cli --version "^2"
```

### OpenAlice build fails

```bash
# Check Node version
node --version  # Should be >= 20

# Try clearing pnpm cache
pnpm store prune
cd vendor/OpenAlice
rm -rf node_modules
pnpm install
pnpm build
```
