import { useState } from 'react'
import SetupWizard from './routes/SetupWizard'
import Dashboard from './routes/Dashboard'
import Logs from './routes/Logs'
import Settings from './routes/Settings'
import Troubleshooting from './routes/Troubleshooting'
import About from './routes/About'

type Page = 'dashboard' | 'setup' | 'logs' | 'settings' | 'troubleshooting' | 'about'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [appState, setAppState] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped')

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'setup', label: 'Setup', icon: '⚙️' },
    { id: 'logs', label: 'Logs', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '🔧' },
    { id: 'troubleshooting', label: 'Troubleshoot', icon: '🔍' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ]

  return (
    <div className="app-container">
      {/* Left Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>OpenAlice Desktop</h1>
          <span className="version">v0.1.0-alpha.1</span>
        </div>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className={`status-dot ${appState}`}></span>
            <span>{appState === 'running' ? 'Running' : appState === 'starting' ? 'Starting...' : 'Stopped'}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2>
            {navItems.find((n) => n.id === currentPage)?.label || 'Dashboard'}
          </h2>
          <div className="top-bar-status">
            <span className="mode-badge">Native Mode</span>
            <span className="agent-badge">Agent: Claude</span>
          </div>
        </header>

        <div className="content-area">
          {currentPage === 'dashboard' && (
            <Dashboard appState={appState} setAppState={setAppState} />
          )}
          {currentPage === 'setup' && <SetupWizard />}
          {currentPage === 'logs' && <Logs />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'troubleshooting' && <Troubleshooting />}
          {currentPage === 'about' && <About />}
        </div>
      </main>
    </div>
  )
}
