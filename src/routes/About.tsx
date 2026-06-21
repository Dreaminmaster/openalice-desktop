export default function About() {
  return (
    <div>
      <div className="card">
        <div className="card-title">OpenAlice Desktop</div>
        <p style={{ fontSize: '14px', margin: '8px 0' }}>
          Version: <strong>0.1.0-alpha.1</strong>
        </p>
        <p style={{ fontSize: '13px', color: '#888', margin: '4px 0' }}>
          A macOS desktop wrapper for OpenAlice, providing a graphical setup
          wizard, environment checking, log management, and process supervision.
        </p>
        <p style={{ fontSize: '13px', color: '#888', margin: '4px 0' }}>
          Repository:{' '}
          <a href="https://github.com/Dreaminmaster/openalice-desktop" style={{ color: '#8b5cf6' }}>
            github.com/Dreaminmaster/openalice-desktop
          </a>
        </p>
      </div>

      <div className="card">
        <div className="card-title">Bundled OpenAlice</div>
        <p style={{ fontSize: '13px', color: '#888' }}>
          Upstream: <a href="https://github.com/TraderAlice/OpenAlice" style={{ color: '#8b5cf6' }}>TraderAlice/OpenAlice</a>
        </p>
        <p style={{ fontSize: '13px', color: '#888' }}>
          License: AGPL-3.0-only
        </p>
        <p style={{ fontSize: '13px', color: '#888' }}>
          Description: Your one-person Wall Street. An AI trading agent covering equities, crypto, commodities, forex, and macro.
        </p>
      </div>

      <div className="card">
        <div className="card-title">Licenses</div>
        <p style={{ fontSize: '13px', color: '#888' }}>
          Desktop wrapper: AGPL-3.0-only
        </p>
        <p style={{ fontSize: '13px', color: '#888' }}>
          See <a href="#LICENSE" style={{ color: '#8b5cf6' }}>LICENSE</a>,{' '}
          <a href="#NOTICE.md" style={{ color: '#8b5cf6' }}>NOTICE.md</a>,{' '}
          <a href="#THIRD_PARTY_NOTICES.md" style={{ color: '#8b5cf6' }}>THIRD_PARTY_NOTICES.md</a>
        </p>
      </div>

      <div className="warning-box" style={{ marginTop: '16px' }}>
        <h4>Risk Disclaimer</h4>
        <p style={{ fontSize: '13px', color: '#ccc' }}>
          OpenAlice Desktop is a local tool. It does not provide financial advice.
          AI-generated trading decisions may be incorrect. Always review before
          executing any trade. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  )
}
