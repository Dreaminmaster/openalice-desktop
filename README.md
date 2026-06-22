# OpenAlice Desktop

[![Build](https://github.com/Dreaminmaster/openalice-desktop/actions/workflows/build-dmg.yml/badge.svg)](https://github.com/Dreaminmaster/openalice-desktop/actions/workflows/build-dmg.yml)

macOS desktop launcher for [OpenAlice](https://github.com/TraderAlice/OpenAlice).

> **OpenAlice Desktop wraps OpenAlice with a graphical setup wizard, environment checking, dependency management, process supervision, log viewing, and diagnostic export.**

## Supported Platforms

| Platform | Architecture | Status |
|----------|-------------|--------|
| macOS 13+ (Ventura) | Apple Silicon (arm64/M1/M2/M3/M4) | ✅ Supported |
| macOS 13+ (Ventura) | Intel (x86_64) | ⚠️ Not yet built (builds available on request) |
| Windows | — | ❌ Not planned |
| Linux | — | ❌ Not planned |

## Download

Latest release: [v1.0.0](https://github.com/Dreaminmaster/openalice-desktop/releases/latest)

**DMG:** `OpenAlice.Desktop_<version>_aarch64.dmg` (~2 MB)

| Attribute | Value |
|-----------|-------|
| Signed | ❌ Ad-hoc signed only |
| Notarized | ❌ No |
| First open | Right-click → Open (Gatekeeper bypass) |

## Quick Start

1. Download the DMG from [Releases](https://github.com/Dreaminmaster/openalice-desktop/releases)
2. Right-click the DMG → Open (to bypass Gatekeeper)
3. Drag `OpenAlice Desktop.app` to `/Applications`
4. Right-click the app in Applications → Open
5. Follow the Setup Wizard to clone and configure OpenAlice
6. Start OpenAlice from the **Runtime** page

## Features

### ✅ Implemented
- Tauri v2 desktop shell with dark theme UI
- First-run Setup Wizard (5 steps)
- Environment check: Git, Node.js, npm, pnpm, Python, Claude Code, Codex
- Port availability check (8000, 3000, 3001, 5173, 47331)
- Auto-clone OpenAlice from GitHub
- Install dependencies (pnpm/npm)
- Build OpenAlice
- Start / Stop / Restart / Force Kill OpenAlice backend
- Open Web UI in browser
- Reveal runtime folder in Finder
- Real-time log viewer (app, backend, UI logs)
- Configuration save/load (mode, paths, ports)
- Diagnostic bundle export (ZIP with system info, deps, ports, logs)

### ❌ Not Yet Implemented
- Docker Mode (UI shows "Coming Soon")
- Auto-install missing system dependencies
- Real trading account integration
- Apple Developer ID signing
- Notarization
- Auto-updater

## Known Issues
- First launch requires right-click → Open (unsigned ad-hoc)
- Some dependencies (Git, Node.js, pnpm) must be installed manually
- Native Mode depends on local environment
- Intel Mac builds not yet produced (can be built from source)

## Building from Source

```bash
git clone --recurse-submodules https://github.com/Dreaminmaster/openalice-desktop.git
cd openalice-desktop
npm install
npx tauri build
```

Requires: Rust, Node.js 20+, npm, Xcode Command Line Tools.

## Verification Scripts

```bash
sh scripts/smoke-test.sh              # Check project structure
sh scripts/verify-runtime-commands.sh # Check all 16 Tauri commands registered
sh scripts/verify-release-artifacts.sh # Check DMG and release
```

## License

AGPL-3.0-only — same as upstream OpenAlice. See [LICENSE](LICENSE).
