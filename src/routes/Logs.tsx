import { useState } from 'react'

export default function Logs() {
  const [selectedLog, setSelectedLog] = useState('desktop')
  const [isPaused, setIsPaused] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const logTypes = [
    { id: 'desktop', label: 'Desktop' },
    { id: 'launcher', label: 'Launcher' },
    { id: 'backend', label: 'OpenAlice Backend' },
    { id: 'ui', label: 'OpenAlice UI' },
    { id: 'uta', label: 'UTA' },
    { id: 'agent', label: 'Agent CLI' },
  ]

  const sampleLogs = `2026-06-22T00:00:00Z [INFO] OpenAlice Desktop v0.1.0-alpha.1 starting
2026-06-22T00:00:01Z [INFO] Loading configuration from ~/.openalice-desktop/config.json
2026-06-22T00:00:01Z [INFO] Data directory: ~/.openalice-desktop/data
2026-06-22T00:00:02Z [INFO] Environment check passed
2026-06-22T00:00:02Z [WARN] Claude Code CLI not found — optional
2026-06-22T00:00:03Z [INFO] Port 47331 available for backend
2026-06-22T00:00:03Z [INFO] Port 5173 available for UI
2026-06-22T00:00:04Z [INFO] Starting OpenAlice backend...
2026-06-22T00:00:05Z [INFO] Backend health check passed
2026-06-22T00:00:05Z [INFO] UI available at http://127.0.0.1:5173
2026-06-22T00:00:06Z [INFO] WebSocket connection established
2026-06-22T00:00:10Z [INFO] Agent: Claude Code initialized
2026-06-22T00:00:10Z [INFO] Ready for workspace operations`

  return (
    <div>
      <div className="card">
        <div className="card-title">Log Viewer</div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedLog}
            onChange={(e) => setSelectedLog(e.target.value)}
          >
            {logTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>{lt.label}</option>
            ))}
          </select>

          <input
            className="form-input"
            placeholder="Search logs..."
            style={{ width: '200px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            📋 Copy
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            📦 Export
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            🗑 Clear
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            📂 Open Directory
          </button>
        </div>

        {/* Log Output */}
        <div className="log-viewer">
          {sampleLogs}
        </div>
      </div>

      {/* Log Directory Info */}
      <div className="card">
        <div className="card-title">Log Directory</div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#888' }}>
          <p>~/.openalice-desktop/logs/</p>
          <p style={{ marginTop: '8px' }}>
            ├── desktop.log<br />
            ├── launcher.log<br />
            ├── openalice-backend.log<br />
            ├── openalice-ui.log<br />
            ├── uta.log<br />
            └── agent-cli.log
          </p>
        </p>
        </div>
      </div>
    </div>
  )
}
