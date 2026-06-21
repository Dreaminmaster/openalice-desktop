import { useState } from 'react'

export default function Settings() {
  const [runMode, setRunMode] = useState('native')
  const [defaultAgent, setDefaultAgent] = useState('claude')
  const [dataDir, setDataDir] = useState('~/.openalice-desktop')
  const [backendPort, setBackendPort] = useState('47331')
  const [uiPort, setUiPort] = useState('5173')
  const [autoRestart, setAutoRestart] = useState(true)
  const [allowRemote, setAllowRemote] = useState(false)

  return (
    <div>
      <div className="card">
        <div className="card-title">General</div>
        <div className="form-group">
          <label className="form-label">Run Mode</label>
          <select className="form-select" value={runMode} onChange={(e) => setRunMode(e.target.value)}>
            <option value="native">Native Mode (Recommended)</option>
            <option value="docker">Docker Mode (Experimental)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Default AI Agent</label>
          <select className="form-select" value={defaultAgent} onChange={(e) => setDefaultAgent(e.target.value)}>
            <option value="claude">Claude Code</option>
            <option value="codex">Codex CLI</option>
            <option value="shell">Shell Agent</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Data Directory</label>
          <input className="form-input" value={dataDir} onChange={(e) => setDataDir(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Network</div>
        <div className="form-group">
          <label className="form-label">Backend Port</label>
          <input className="form-input" type="number" value={backendPort} onChange={(e) => setBackendPort(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">UI Port</label>
          <input className="form-input" type="number" value={uiPort} onChange={(e) => setUiPort(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={allowRemote} onChange={(e) => setAllowRemote(e.target.checked)} />
          <span style={{ fontSize: '14px' }}>Allow LAN Access</span>
        </label>
        {allowRemote && (
          <div className="warning-box" style={{ marginTop: '12px' }}>
            <h4>⚠️ Security Warning</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>
              This will allow other devices on your local network to access OpenAlice.
              Ensure you understand the security implications.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Behavior</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={autoRestart} onChange={(e) => setAutoRestart(e.target.checked)} />
          <span style={{ fontSize: '14px' }}>Auto-restart on crash</span>
        </label>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary">Save Settings</button>
        <button className="btn btn-secondary">Reset to Defaults</button>
      </div>
    </div>
  )
}
