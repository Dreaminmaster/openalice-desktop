# OpenAlice Desktop v1.0.0 — Release Acceptance Report

**Version:** v1.0.0  
**Commit:** `523e756`  
**Release:** https://github.com/Dreaminmaster/openalice-desktop/releases/tag/v1.0.0  
**Published:** 2026-06-22T10:02:09Z  
**Build Environment:** GitHub Actions `macos-latest` (macOS 15 arm64)

---

## 1. Release Artifacts

| Attribute | Value |
|-----------|-------|
| **DMG filename** | `OpenAlice.Desktop_1.0.0_aarch64.dmg` |
| **DMG size** | ~2.1 MB (2,130,532 bytes) |
| **Architecture** | Apple Silicon (aarch64 / M1/M2/M3/M4) |
| **Intel support** | ❌ Not pre-built (can build from source on Intel Mac) |
| **Universal binary** | ❌ No |
| **Ad-hoc signed** | ✅ Yes (Tauri default) |
| **Apple Developer ID signed** | ❌ No |
| **Notarized** | ❌ No |

---

## 2. Installation

### First Open Method

Since the app is not notarized, macOS Gatekeeper will block it:

1. Download the DMG from [Releases](https://github.com/Dreaminmaster/openalice-desktop/releases/tag/v1.0.0)
2. Double-click `OpenAlice.Desktop_1.0.0_aarch64.dmg` to mount
3. Drag `OpenAlice Desktop.app` to `/Applications`
4. **Right-click** the app in `/Applications` → **Open**
5. Click **Open** in the Gatekeeper dialog
6. (Alternative) Run in Terminal: `xattr -dr com.apple.quarantine "/Applications/OpenAlice Desktop.app"`

---

## 3. First-Run Flow

1. App opens to a **5-step Setup Wizard**
2. **Step 1 — Welcome**: overview text, click Next
3. **Step 2 — Environment Check**: auto-detects Git, Node.js, npm, pnpm, Python, Claude Code, Codex. Shows installed/missing.
4. **Step 3 — OpenAlice Setup**: shows repo status. Click "Clone OpenAlice" to auto-download.
5. **Step 4 — Install & Build**: click "Install Dependencies" then build. Or skip and do later.
6. **Step 5 — Ready**: review, click "Start Using OpenAlice Desktop"

### Paths Created

```
~/Library/Application Support/OpenAlice Desktop/
├── config/config.json          # Saved settings
├── logs/
│   ├── app.log                 # Desktop app log
│   ├── openalice-backend.log   # Backend stdout/stderr
│   ├── openalice-ui.log        # UI log
│   └── install.log             # Dependency install log
├── runtime/                    # Reserved
├── diagnostics/                # Diagnostic bundles
└── openalice/                  # Cloned OpenAlice repo
```

### Clone Path

OpenAlice is cloned to:
```
~/Library/Application Support/OpenAlice Desktop/openalice/
```

### Install & Build Commands

| Action | Command | UI Button |
|--------|---------|-----------|
| Clone | `git clone --depth 1 https://github.com/TraderAlice/OpenAlice.git <path>` | "Clone OpenAlice" |
| Install deps | `pnpm install` (falls back to `npm install`) | "Install Dependencies" |
| Build | `pnpm build` | "Build OpenAlice" |

---

## 4. Native Mode Usage Flow

1. **Dashboard**: shows running status, data dir, version
2. **Environment**: check all 7 system deps + 5 ports with ✅/❌
3. **OpenAlice**: view repo info (branch, commit, package.json, dist, node_modules)
4. **Runtime**:
   - **Start**: checks port availability, spawns `node dist/main.js` in OpenAlice dir
   - **Stop**: kills child process
   - **Force Kill**: runs `kill -9 <pid>`
   - **Restart**: stop + 2s delay + start
   - **Open Web UI**: runs `open http://127.0.0.1:3000`
   - **Reveal Folder**: runs `open ~/Library/Application Support/OpenAlice Desktop/openalice/`
5. **Logs**: 3 log types (app/backend/ui), auto-refreshes every 3s
6. **Settings**: mode (native/docker), path, backend port, UI port
7. **Diagnostics**: export ZIP with system info, deps, ports, config (redacted), all logs
8. **About**: version, implemented/not-implemented lists, known issues

### Ports

| Port | Purpose | Default |
|------|---------|---------|
| 8000 | Backend | Default |
| 3000 | UI | Default |
| 3001 | UI fallback | Checked |
| 5173 | Vite dev | Checked |
| 47331 | OpenAlice default | Checked |

---

## 5. Docker Mode Status

**Docker Mode is NOT implemented.** The UI shows "Docker Mode (Coming Soon)" in Settings. Selecting Docker mode has no effect. The Run Mode dropdown accepts the value but all runtime operations use Native Mode.

---

## 6. Self-Check Scripts

### scripts/smoke-test.sh
Validates 12 essential project files exist:
```bash
cd openalice-desktop
sh scripts/smoke-test.sh
```
Expected: `Results: 12 passed, 0 failed`

### scripts/verify-runtime-commands.sh
Checks all 18 Tauri commands are registered in `lib.rs` AND implemented in `commands/mod.rs`:
```bash
sh scripts/verify-runtime-commands.sh
```
Expected: `Results: 36 passed, 0 failed`

Verified commands:
- get_app_status, init_app_dirs, check_system_dependencies, check_ports
- start_openalice, stop_openalice, restart_openalice, get_process_status
- tail_openalice_logs, save_config, load_config, export_diagnostics
- get_openalice_info, clone_openalice, install_openalice_deps, build_openalice
- open_web_ui, reveal_runtime_folder

### scripts/verify-release-artifacts.sh
Checks local DMG exists and GitHub release assets:
```bash
sh scripts/verify-release-artifacts.sh
```

---

## 7. User Acceptance Checklist

### Step-by-step verification

| # | Step | Expected | If Failed |
|---|------|----------|-----------|
| 1 | Download DMG from Release | File downloads | Check network |
| 2 | Double-click DMG | Mounts as volume | Right-click → Open if blocked |
| 3 | Drag app to Applications | Copies successfully | Check disk space |
| 4 | Right-click app → Open | Gatekeeper dialog → click Open | See install section above |
| 5 | App opens | Shows Setup Wizard Welcome | Check `app.log` |
| 6 | Click Next → Environment tab | Shows 7 dep checks | Missing deps shown in red |
| 7 | Click Next → OpenAlice Setup | Shows "not cloned" | Click Clone button |
| 8 | Click Clone OpenAlice | Spinner → "✅ Cloned" | Check `install.log` |
| 9 | Click Next → Install & Build | Click Install Dependencies | Need pnpm installed |
| 10 | Click Next → Ready | "Setup complete!" | Backtrack and fix |
| 11 | Finish wizard → Dashboard | Shows app status JSON | Check `app.log` |
| 12 | Go to Runtime → Start | "OpenAlice started" with PID | Check `openalice-backend.log` |
| 13 | Go to Logs → Backend | Shows backend output | Wait for logs to populate |
| 14 | Runtime → Open Web UI | Browser opens http://127.0.0.1:3000 | Port may differ |
| 15 | Runtime → Restart | Process restarts | Check logs |
| 16 | Runtime → Stop | "Stopped" | Force Kill if stuck |
| 17 | Diagnostics → Export | ZIP created at reported path | Verify path in output |
| 18 | Settings → Save | "Saved!" alert | Check `config/config.json` |

### Logging

All operations write to `~/Library/Application Support/OpenAlice Desktop/logs/app.log`.  
Backend logs: `openalice-backend.log`.  
Install logs: `install.log`.

---

## 8. Known Issues

1. **Unsigned app**: macOS Gatekeeper blocks first launch → right-click → Open
2. **Dependencies**: Git, Node.js, pnpm must be pre-installed by user
3. **Intel Mac**: not pre-built (can `npx tauri build` from source on Intel)
4. **OpenAlice image**: v0.2.0+ icons may look basic (plain PNG)
5. **Port conflict**: if port 8000 occupied, start fails with clear message — change in Settings
6. **Docker Mode**: UI element exists but functionality is not implemented

---

## 9. v1.0.1 Fix Plan

If issues found during acceptance testing:
1. File a GitHub Issue at https://github.com/Dreaminmaster/openalice-desktop/issues
2. Fix on `main` branch
3. Tag `v1.0.1` → CI auto-builds DMG → auto-creates Release
4. DO NOT overwrite `v1.0.0` tag

---

*Generated 2026-06-22 for v1.0.0 acceptance review.*
