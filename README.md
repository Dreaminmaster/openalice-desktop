# OpenAlice Desktop

macOS 桌面应用 — 将 OpenAlice 封装为可下载的 DMG 安装包。

> **OpenAlice Desktop = OpenAlice 本体 + macOS 桌面启动器 + 首次配置向导 + 环境检查 + 日志面板 + 运行模式管理**

## 产品定位

OpenAlice Desktop **不是**重新写一个交易系统，也不是重写 OpenAlice。它是一个 macOS 桌面化封装层：

- ✅ 启动 OpenAlice 后端 & UI
- ✅ 首次设置向导（欢迎 → 模式选择 → 环境检查 → AI 接入 → 交易模式 → 启动）
- ✅ 管理本地数据目录 (`~/.openalice-desktop/`)
- ✅ 检查 Node / Git / Claude Code / Codex / pnpm 等依赖
- ✅ 管理 AI CLI 接入（Claude Code / Codex / Shell）
- ✅ 管理日志面板 & 诊断包导出
- ✅ 管理端口 & 进程生命周期
- ✅ Native Mode（默认） & Docker Mode（预留）

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面外壳 | Tauri v2 (Rust) |
| 前端 | React 19 + TypeScript + Vite |
| 运行时 | 内置 Node.js (arm64/x64) |
| OpenAlice | Git Submodule (TraderAlice/OpenAlice) |
| 构建 | GitHub Actions (macos-15 runner) |
| 打包 | DMG (arm64 + x64 分别构建) |

## 快速开始

```bash
# 克隆仓库（含 submodule）
git clone --recurse-submodules https://github.com/Dreaminmaster/openalice-desktop.git
cd openalice-desktop

# 初始化 Tauri 项目
pnpm install

# 开发模式
pnpm tauri dev

# 构建
pnpm tauri build
```

## 目录结构

```
openalice-desktop/
├── README.md
├── LICENSE
├── NOTICE
├── THIRD_PARTY_NOTICES.md
├── OPENALICE_UPSTREAM.md
├── package.json
├── pnpm-workspace.yaml
├── src/                          # Tauri frontend (React + TS)
│   ├── main.tsx
│   ├── routes/                   # SetupWizard, Dashboard, Logs, Settings...
│   ├── components/
│   ├── stores/
│   └── api/
├── src-tauri/                    # Tauri backend (Rust)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   ├── icons/
│   └── src/
│       ├── main.rs               # Tauri entry point
│       ├── commands/             # Tauri commands
│       ├── launcher/             # Process management
│       ├── diagnostics/          # Env checker
│       ├── logs/                 # Log manager
│       └── ports/                # Port resolver
├── vendor/
│   └── OpenAlice/                # Git submodule (upstream)
├── runtime/
│   ├── node/                     # Bundled Node runtime
│   ├── scripts/                  # Build & setup scripts
│   └── openalice-dist/           # Pre-built OpenAlice
├── scripts/
│   ├── fetch-openalice.sh
│   ├── build-openalice.sh
│   ├── prepare-runtime.sh
│   ├── build-dmg.sh
│   ├── smoke-test.sh
│   └── make-diagnostic-bundle.sh
├── docs/
│   ├── PRODUCT_SPEC.md           # 本文档来源
│   ├── BUILD_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   ├── SECURITY.md
│   └── LICENSE_COMPLIANCE.md
└── tests/
    ├── launcher.test.ts
    ├── diagnostics.test.ts
    └── e2e/
```

## 产品路线图

| 版本 | 内容 |
|------|------|
| v0.1.0 | Native Mode 基础框架 + Setup Wizard + Environment Checker |
| v0.2.0 | Launcher Service + Logs Panel + Health Check |
| v0.3.0 | AI Connector Manager + Agent Selection |
| v0.4.0 | Docker Mode (experimental) |
| v0.5.0 | Auto-updater + Menu Bar integration |
| v1.0.0 | Stable release with DMG distribution |

## 上游项目

- **OpenAlice**: [TraderAlice/OpenAlice](https://github.com/TraderAlice/OpenAlice)
- **License**: AGPL-3.0-only
- **Stars**: ~5,450

## 合规声明

本项目遵循 AGPL-3.0 许可证。详见 [LICENSE](LICENSE)、[NOTICE](NOTICE)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

---

Built with ❤️ for the open-source trading community.
