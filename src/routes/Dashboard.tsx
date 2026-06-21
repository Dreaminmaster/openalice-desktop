import { useState } from 'react'

interface DashboardProps {
  appState: 'stopped' | 'starting' | 'running' | 'error'
  setAppState: (state: 'stopped' | 'starting' | 'running' | 'error') => void
}

export default function Dashboard({ appState, setAppState }: DashboardProps) {
  const [envChecked, setEnvChecked] = useState(false)
  const [envResult, setEnvResult] = useState<string | null>(null)

  const handleStart = () => {
    setAppState('starting')
    setTimeout(() => {
      setAppState('running')
    }, 2000)
  }

  const handleStop = () => {
    setAppState('stopped')
  }

  return (
    <div>
      {/* Welcome */}
      <div className="welcome-section">
        <h2>Welcome to OpenAlice Desktop</h2>
        <p>
          Your one-person Wall Street. A local AI trading workbench
          powered by Claude Code, Codex, and your favorite agents.
        </p>
        <p style={{ fontSize: '13px', color: '#666' }}>
          Default mode: Research only. Real trading requires explicit opt-in.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-4">
        <div className="card">
          <div className="card-title">OpenAlice</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>
            {appState === 'running' && <span style={{ color: '#22c55e' }}>Running</span>}
            {appState === 'starting' && <span style={{ color: '#eab308' }}>Starting...</span>}
            {(appState === 'stopped' || appState === 'error') && <span style={{ color: '#ef4444' }}>Stopped</span>}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Default Agent</div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>Claude Code</div>
        </div>
        <div className="card">
          <div className="card-title">Trading Mode</div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>Research Only</div>
        </div>
        <div className="card">
          <div className="card-title">Data Directory</div>
          <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>~/.openalice-desktop</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="btn-group" style={{ justifyContent: 'center' }}>
        {appState !== 'running' && (
          <>
            <button className="btn btn-success" onClick={handleStart}>
              ▶ Start OpenAlice
            </button>
            <button className="btn btn-secondary" onClick={() => setEnvChecked(true)}>
              🔍 Check Environment
            </button>
          </>
        )}
        {appState === 'running' && (
          <>
            <button className="btn btn-danger" onClick={handleStop}>
              ⏹ Stop
            </button>
            <button className="btn btn-secondary">
              🔄 Restart
            </button>
          </>
        )}
        <button className="btn btn-secondary">
          📂 Open Workbench
        </button>
        <button className="btn btn-secondary">
          📦 Export Diagnostic Bundle
        </button>
      </div>

      {/* Environment Check Result */}
      {envChecked && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-title">Environment Check</div>
          <div className="check-item ready">
            <span className="check-label">macOS Version</span>
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
            <span className="check-label">Data Directory</span>
            <span className="check-status ready">✅ Ready</span>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="warning-box" style={{ marginTop: '24px' }}>
        <h4>Next Steps</h4>
        <ol style={{ paddingLeft: '20px', color: '#ccc' }}>
          <li>Run environment check to verify prerequisites</li>
          <li>Configure your default AI agent (Claude / Codex)</li>
          <li>Set up your trading mode (research / paper / live)</li>
          <li>Click Start to launch OpenAlice</li>
        </ol>
      </div>
    </div>
  )
}
