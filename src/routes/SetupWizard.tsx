export default function SetupWizard() {
  return (
    <div>
      <div className="welcome-section">
        <h2>Setup Wizard</h2>
        <p>Let's configure OpenAlice Desktop. This takes about 2 minutes.</p>
      </div>

      {/* Step 1: Run Mode */}
      <div className="card">
        <div className="card-title">Step 1: Choose Run Mode</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="check-item ready" style={{ flex: 1 }}>
            <div>
              <strong>Native Mode</strong>
              <p style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>
                Runs on your Mac. Faster, smaller. Recommended.
              </p>
            </div>
            <span className="check-status ready">✓ Default</span>
          </div>
          <div className="check-item" style={{ flex: 1, opacity: 0.6 }}>
            <div>
              <strong>Docker Mode</strong>
              <p style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>
                Runs in a container. Isolated. Requires Docker.
              </p>
            </div>
            <span className="check-status missing">Experimental</span>
          </div>
        </div>
      </div>

      {/* Step 2: Environment Check */}
      <div className="card">
        <div className="card-title">Step 2: Environment Check</div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
          Checking your system for required dependencies...
        </p>
        <div className="check-item ready">
          <span className="check-label">macOS 13+ (Ventura)</span>
          <span className="check-status ready">✅ Ready</span>
        </div>
        <div className="check-item ready">
          <span className="check-label">Git</span>
          <span className="check-status ready">✅ Ready</span>
        </div>
        <div className="check-item warning">
          <span className="check-label">Claude Code CLI</span>
          <span className="check-status warning">⚠️ Optional</span>
        </div>
        <div className="check-item warning">
          <span className="check-label">Codex CLI</span>
          <span className="check-status warning">⚠️ Optional</span>
        </div>
        <div className="check-item ready">
          <span className="check-label">Data Directory Writable</span>
          <span className="check-status ready">✅ Ready</span>
        </div>
      </div>

      {/* Step 3: AI Agent */}
      <div className="card">
        <div className="card-title">Step 3: AI Agent Configuration</div>
        <div className="form-group">
          <label className="form-label">Default Agent</label>
          <select className="form-select">
            <option value="claude">Claude Code (recommended)</option>
            <option value="codex">Codex CLI</option>
            <option value="shell">Shell Agent</option>
          </select>
        </div>
        <div className="warning-box" style={{ marginTop: '12px' }}>
          <h4>How Agents Work</h4>
          <p style={{ fontSize: '13px', color: '#ccc' }}>
            OpenAlice Desktop does not include AI models. It connects to CLI tools
            already installed on your Mac. Make sure Claude Code or Codex is installed
            and logged in before launching.
          </p>
        </div>
      </div>

      {/* Step 4: Trading Mode */}
      <div className="card">
        <div className="card-title">Step 4: Trading Mode</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#1a1a24', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="radio" name="trading-mode" defaultChecked />
            <div>
              <strong>🔬 Research Only</strong>
              <p style={{ fontSize: '12px', color: '#888' }}>AI analyzes markets but never executes trades.</p>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#1a1a24', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="radio" name="trading-mode" />
            <div>
              <strong>📊 Paper Trading</strong>
              <p style={{ fontSize: '12px', color: '#888' }}>Simulated trades with real market data.</p>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#1a1a24', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="radio" name="trading-mode" />
            <div>
              <strong>💰 Live Trading</strong>
              <p style={{ fontSize: '12px', color: '#888' }}>Connects to real broker accounts.</p>
            </div>
          </label>
        </div>
        <div className="warning-box danger" style={{ marginTop: '12px' }}>
          <h4>⚠️ Risk Warning</h4>
          <p style={{ fontSize: '13px', color: '#ccc' }}>
            Live trading connects to real broker accounts. AI may generate incorrect judgments.
            All trades require explicit user confirmation. Automatic order execution is disabled by default.
          </p>
        </div>
      </div>

      {/* Step 5: Data Directory */}
      <div className="card">
        <div className="card-title">Step 5: Data Directory</div>
        <div className="form-group">
          <label className="form-label">Data Directory</label>
          <input className="form-input" defaultValue="~/.openalice-desktop" readOnly />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
            Desktop-specific data directory. Does not conflict with upstream ~/.openalice.
          </p>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary">✓ Complete Setup & Start</button>
        <button className="btn btn-secondary">Skip Setup</button>
      </div>
    </div>
  )
}
