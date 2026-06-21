export default function Troubleshooting() {
  const commonIssues = [
    {
      id: 'claude-not-found',
      title: 'claude: command not found',
      severity: 'warning',
      description: 'Claude Code CLI is not installed or not in PATH.',
      fix: 'Install Claude Code: npm install -g @anthropic-ai/claude-code',
      autoFix: false,
    },
    {
      id: 'codex-not-found',
      title: 'codex: command not found',
      severity: 'info',
      description: 'Codex CLI is not installed or not in PATH.',
      fix: 'Install Codex: cargo install codex',
      autoFix: false,
    },
    {
      id: 'port-in-use',
      title: 'Port already in use',
      severity: 'error',
      description: 'The required port (47331 or 5173) is already occupied.',
      fix: 'Change ports in Settings or kill the conflicting process.',
      autoFix: true,
    },
    {
      id: 'backend-failed',
      title: 'Backend startup failed',
      severity: 'error',
      description: 'OpenAlice backend process exited with an error.',
      fix: 'Check logs for detailed error. Try restarting.',
      autoFix: false,
    },
    {
      id: 'ui-disconnected',
      title: 'UI cannot connect to backend',
      severity: 'error',
      description: 'The webview cannot reach the backend at the configured port.',
      fix: 'Verify backend is running and port configuration is correct.',
      autoFix: false,
    },
    {
      id: 'node-pty-failed',
      title: 'node-pty module failed',
      severity: 'error',
      description: 'The node-pty native module is missing or has wrong architecture.',
      fix: 'Rebuild OpenAlice on the target architecture (arm64 or x64).',
      autoFix: false,
    },
    {
      id: 'git-missing',
      title: 'Git not found',
      severity: 'error',
      description: 'Git is required but not installed.',
      fix: 'Install Git: brew install git',
      autoFix: false,
    },
    {
      id: 'permission-denied',
      title: 'Permission denied on data directory',
      severity: 'error',
      description: 'The app cannot write to ~/.openalice-desktop.',
      fix: 'chmod -R 755 ~/.openalice-desktop',
      autoFix: false,
    },
    {
      id: 'app-quarantine',
      title: 'App blocked by macOS',
      severity: 'error',
      description: 'macOS Gatekeeper blocked the application.',
      fix: 'Right-click → Open, or run: xattr -dr com.apple.quarantine /Applications/OpenAlice\\ Desktop.app',
      autoFix: false,
    },
  ]

  return (
    <div>
      <div className="card">
        <div className="card-title">Troubleshooting Center</div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
          Common issues and their solutions. Click "Copy Fix Command" to get the exact terminal command.
        </p>

        {commonIssues.map((issue) => (
          <div
            key={issue.id}
            className={`check-item ${issue.severity === 'error' ? 'missing' : issue.severity === 'warning' ? 'warning' : ''}`}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px' }}>{issue.title}</strong>
                {issue.autoFix && (
                  <span className="check-status ready">Auto-fix available</span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {issue.description}
              </p>
              <code style={{ fontSize: '11px', color: '#666', background: '#111', padding: '2px 6px', borderRadius: '4px' }}>
                {issue.fix}
              </code>
            </div>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
              📋 Copy
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Diagnostic Bundle</div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
          Export all logs and system information for debugging. Sensitive data is automatically redacted.
        </p>
        <button className="btn btn-primary">📦 Export Diagnostic Bundle</button>
      </div>

      <div className="card">
        <div className="card-title">Reset</div>
        <button className="btn btn-danger">🗑 Reset All Settings</button>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
          This will delete all configuration and reset to defaults. Your data directory will not be affected.
        </p>
      </div>
    </div>
  )
}
