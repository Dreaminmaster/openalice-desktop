# TROUBLESHOOTING GUIDE

## Common Issues

### 1. App Won't Open ("Damaged" or Blocked)

**Symptom**: macOS shows "OpenAlice Desktop is damaged and can't be opened"

**Cause**: The app is ad-hoc signed and not notarized.

**Fix**:
```bash
# Option A: Right-click workaround
# Right-click the app → Open → Open (confirm the warning)

# Option B: Remove quarantine attribute
xattr -dr com.apple.quarantine /Applications/OpenAlice\ Desktop.app

# Option C: Allow in System Settings
# System Settings → Privacy & Security → Scroll down → "Open Anyway"
```

### 2. Claude Code Not Found

**Symptom**: Setup wizard shows "Claude Code CLI not found"

**Fix**:
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# If already installed but not in PATH
# Check your shell profile (~/.zshrc, ~/.bash_profile)
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Port Already in Use

**Symptom**: "Port 47331 already in use"

**Fix**:
```bash
# Find what's using the port
lsof -i :47331

# Kill the process
kill -9 <PID>

# Or change the port in Settings
```

### 4. Backend Won't Start

**Symptom**: Launcher shows error, logs show startup failure

**Troubleshooting**:
```bash
# Check if OpenAlice dist exists
ls -la ~/.openalice-desktop/runtime/openalice-dist/dist/

# Check logs
cat ~/.openalice-desktop/logs/openalice-backend.log

# Try starting from command line
cd ~/.openalice-desktop/runtime/openalice-dist
OPENALICE_HOME=~/.openalice-desktop/data node dist/main.js
```

### 5. node-pty Errors

**Symptom**: "Cannot find module node-pty" or "bad CPU type"

**Fix**:
```bash
# Rebuild OpenAlice on the correct architecture
cd vendor/OpenAlice
pnpm install
pnpm build

# Verify node-pty architecture
find runtime/openalice-dist -name "*.node" -exec file {} \;

# If wrong architecture, rebuild on the correct Mac
```

### 6. Git Not Found

**Symptom**: "Git is required but not installed"

**Fix**:
```bash
# Install via Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

### 7. Permission Denied on Data Directory

**Symptom**: "Cannot write to ~/.openalice-desktop"

**Fix**:
```bash
mkdir -p ~/.openalice-desktop
chmod 755 ~/.openalice-desktop
```

### 8. WebSocket Disconnected

**Symptom**: UI shows "WebSocket disconnected"

**Possible causes**:
- Backend crashed or was stopped
- Port changed (auto-reassignment)
- Firewall blocking localhost connections

**Fix**:
```bash
# Check if backend is running
ps aux | grep "openalice"

# Restart the app
# In Settings → Stop → Start
```

## Exporting Diagnostics

When reporting issues, include a diagnostic bundle:

1. Open the app → Settings → Troubleshooting
2. Click "Export Diagnostic Bundle"
3. Attach the resulting `.tar.gz` file to your issue

Or from command line:
```bash
./scripts/make-diagnostic-bundle.sh
```

## Getting Help

- GitHub Issues: https://github.com/Dreaminmaster/openalice-desktop/issues
- Upstream OpenAlice: https://github.com/TraderAlice/OpenAlice/issues
