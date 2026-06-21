# Security Policy

## Design Principles

1. **Local by default**: All services bind to `127.0.0.1` only
2. **No key storage**: The desktop wrapper never stores API keys or secrets
3. **Log sanitization**: All log output is redacted for sensitive data
4. **Risk confirmation**: Live trading requires explicit user opt-in
5. **AGPL compliance**: All upstream licenses are preserved

## What We Don't Do

- ❌ We don't include AI models (Claude, OpenAI, etc.)
- ❌ We don't store API keys in our config
- ❌ We don't auto-execute real trades
- ❌ We don't expose services to the network by default
- ❌ We don't bypass macOS security mechanisms

## Sensitive Data Handling

### Log Sanitization

All log output is processed through `sanitize_logs()` which redacts:

```
api_key=***
secret=***
token=***
password=***
Authorization: Bearer ***
```

### Configuration

User configuration is stored at `~/.openalice-desktop/config.json`. Sensitive fields are managed by OpenAlice itself, not by the desktop wrapper.

### Diagnostic Bundles

When exporting diagnostic bundles, all sensitive data is automatically redacted before the archive is created.

## Trading Safety

### Default Mode: Research Only

The application starts in "Research Only" mode. No trades are executed.

### Paper Trading

Simulated trades with real market data. No real money at risk.

### Live Trading

Requires explicit user confirmation with risk warnings:

```
⚠️ LIVE TRADING WARNING

Live trading connects to real broker accounts.
AI may generate incorrect judgments.
All trades require manual confirmation.
Automatic order execution is DISABLED by default.

By enabling live trading, you acknowledge these risks.
```

## Network Security

### Default Binding

All services bind to `127.0.0.1`:
- Backend: port 47331 (default)
- MCP: port 47332 (default)
- UI: port 5173 (default)

### Remote Access (Advanced)

LAN access can be enabled in Settings but is OFF by default. Enabling it shows a security warning.

## macOS Security

### Gatekeeper

The app is ad-hoc signed for development. For distribution:
- Consider Apple Developer Program membership
- Code signing with proper entitlements
- Notarization recommended (not required for personal use)

### Quarantine

If macOS blocks the app:
```bash
xattr -dr com.apple.quarantine /Applications/OpenAlice\ Desktop.app
```

## Reporting Security Issues

Please report security vulnerabilities via:
https://github.com/Dreaminmaster/openalice-desktop/security/advisories/new
