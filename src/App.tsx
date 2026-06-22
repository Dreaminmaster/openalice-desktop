import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

type Page =
  | "dashboard"
  | "envcheck"
  | "openalice"
  | "runtime"
  | "logs"
  | "settings"
  | "diagnostics"
  | "about";

interface NavItem {
  id: Page;
  label: string;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "envcheck", label: "Environment" },
  { id: "openalice", label: "OpenAlice" },
  { id: "runtime", label: "Runtime" },
  { id: "logs", label: "Logs" },
  { id: "settings", label: "Settings" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "about", label: "About" },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f0f14",
    color: "#e8e8f0",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  sidebar: {
    width: 220,
    background: "#1a1a24",
    padding: "16px 0",
    borderRight: "1px solid #2a2a3a",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    padding: "0 16px 12px",
    fontSize: 15,
    fontWeight: 700,
    borderBottom: "1px solid #2a2a3a",
    marginBottom: 8,
  },
  navBtn: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    border: "none",
    background: "transparent",
    color: "#9898a8",
    textAlign: "left" as const,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  navBtnActive: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    border: "none",
    background: "rgba(139,92,246,0.15)",
    color: "#8b5cf6",
    textAlign: "left" as const,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    borderLeft: "3px solid #8b5cf6",
  },
  main: {
    flex: 1,
    padding: 24,
    overflowY: "auto" as const,
  },
  header: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    color: "#e8e8f0",
  },
  card: {
    background: "#1a1a24",
    border: "1px solid #2a2a3a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  btn: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    background: "#8b5cf6",
    color: "#fff",
  },
  btnDanger: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    background: "#ef4444",
    color: "#fff",
  },
  btnSuccess: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    background: "#22c55e",
    color: "#fff",
  },
  btnGroup: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap" as const,
  },
  logViewer: {
    background: "#000",
    borderRadius: 8,
    padding: 12,
    fontFamily:
      "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
    fontSize: 11,
    lineHeight: 1.7,
    maxHeight: 400,
    overflowY: "auto" as const,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-all" as const,
    color: "#a8a8b8",
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  badgeGreen: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
    background: "rgba(34,197,94,0.2)",
    color: "#22c55e",
  },
  badgeRed: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
    background: "rgba(239,68,68,0.2)",
    color: "#ef4444",
  },
  badgeYellow: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
    background: "rgba(234,179,8,0.2)",
    color: "#eab308",
  },
  select: {
    width: "100%",
    padding: "8px 12px",
    background: "#252530",
    border: "1px solid #2a2a3a",
    borderRadius: 6,
    color: "#e8e8f0",
    fontSize: 13,
    fontFamily: "inherit",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    background: "#252530",
    border: "1px solid #2a2a3a",
    borderRadius: 6,
    color: "#e8e8f0",
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>OpenAlice Desktop</div>
        {NAV.map((item) => (
          <button
            key={item.id}
            style={
              page === item.id ? styles.navBtnActive : styles.navBtn
            }
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 16px", fontSize: 11, color: "#555" }}>
          v0.2.0-alpha.1
        </div>
      </div>
      <div style={styles.main}>
        {page === "dashboard" && <Dashboard />}
        {page === "envcheck" && <EnvCheck />}
        {page === "openalice" && <OpenAliceMgmt />}
        {page === "runtime" && <Runtime />}
        {page === "logs" && <Logs />}
        {page === "settings" && <Settings />}
        {page === "diagnostics" && <Diagnostics />}
        {page === "about" && <About />}
      </div>
    </div>
  );
}

// ─── Dashboard ───

function Dashboard() {
  const [status, setStatus] = useState<any>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await invoke("get_app_status");
      setStatus(s);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div>
      <h2 style={styles.header}>Dashboard</h2>
      <div style={styles.card}>
        <div style={styles.cardTitle}>App Status</div>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(status, null, 2) || "Loading..."}
        </pre>
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnPrimary} onClick={async () => { await invoke("init_app_dirs"); refresh(); }}>
          Init App Dirs
        </button>
        <button style={styles.btnPrimary} onClick={refresh}>
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Environment Check ───

function EnvCheck() {
  const [deps, setDeps] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);

  const check = async () => {
    try {
      const d = await invoke("check_system_dependencies");
      setDeps(d as any[]);
      const p = await invoke("check_ports");
      setPorts(p as any[]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div>
      <h2 style={styles.header}>Environment Check</h2>
      <div style={styles.card}>
        <div style={styles.cardTitle}>System Dependencies</div>
        {deps.map((d: any) => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a3a", fontSize: 13 }}>
            <strong>{d.name}</strong>
            <span>
              {d.installed ? (
                <span style={styles.badgeGreen}>✅ {d.version || "installed"}</span>
              ) : (
                <span style={styles.badgeRed}>❌ missing</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Port Status</div>
        {ports.map((p: any) => (
          <div key={p.port} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a3a", fontSize: 13 }}>
            <strong>Port {p.port}</strong>
            <span>
              {p.available ? (
                <span style={styles.badgeGreen}>✅ Available</span>
              ) : (
                <span style={styles.badgeRed}>❌ In Use</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnPrimary} onClick={check}>Re-check</button>
      </div>
    </div>
  );
}

// ─── Runtime ───

function Runtime() {
  const [procStatus, setProcStatus] = useState<any>(null);

  const refresh = async () => {
    try {
      const s = await invoke("get_process_status");
      setProcStatus(s);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <h2 style={styles.header}>OpenAlice Runtime</h2>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Process Status</div>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(procStatus, null, 2) || "Loading..."}
        </pre>
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnSuccess} onClick={async () => { await invoke("start_openalice"); refresh(); }}>
          Start OpenAlice
        </button>
        <button style={styles.btnDanger} onClick={async () => { await invoke("stop_openalice"); refresh(); }}>
          Stop OpenAlice
        </button>
        <button style={styles.btnPrimary} onClick={async () => { await invoke("restart_openalice"); refresh(); }}>
          Restart
        </button>
        <button style={styles.btnPrimary} onClick={refresh}>
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Logs ───

function Logs() {
  const [logType, setLogType] = useState("app");
  const [logs, setLogs] = useState("");

  const refresh = async () => {
    try {
      const text = await invoke("tail_openalice_logs", { logType, lines: 100 });
      setLogs(text as string);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { refresh(); }, [logType]);

  return (
    <div>
      <h2 style={styles.header}>Logs</h2>
      <div style={{ marginBottom: 12 }}>
        <select style={styles.select} value={logType} onChange={(e) => setLogType(e.target.value)}>
          <option value="app">App Log</option>
          <option value="backend">Backend Log</option>
          <option value="ui">UI Log</option>
        </select>
      </div>
      <div style={styles.logViewer}>
        {logs || "No logs yet."}
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnPrimary} onClick={refresh}>Refresh</button>
      </div>
    </div>
  );
}

// ─── Settings ───

function Settings() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    invoke("load_config").then(setConfig).catch(console.error);
  }, []);

  const save = async () => {
    try {
      await invoke("save_config", { config });
      alert("Saved!");
    } catch (e: any) {
      alert("Error: " + e);
    }
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={styles.header}>Settings</h2>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Mode</div>
        <select style={styles.select} value={config.mode} onChange={(e) => setConfig({ ...config, mode: e.target.value })}>
          <option value="native">Native Mode</option>
          <option value="docker">Docker Mode (Coming Soon)</option>
        </select>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>OpenAlice Path</div>
        <input style={styles.input} value={config.openalice_path || ""} onChange={(e) => setConfig({ ...config, openalice_path: e.target.value })} />
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Ports</div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "#888" }}>Backend</label>
            <input style={styles.input} type="number" value={config.backend_port} onChange={(e) => setConfig({ ...config, backend_port: parseInt(e.target.value) })} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "#888" }}>UI</label>
            <input style={styles.input} type="number" value={config.ui_port} onChange={(e) => setConfig({ ...config, ui_port: parseInt(e.target.value) })} />
          </div>
        </div>
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnPrimary} onClick={save}>Save Config</button>
      </div>
    </div>
  );
}

// ─── Diagnostics ───

function Diagnostics() {
  const [result, setResult] = useState<any>(null);

  const exportDiag = async () => {
    try {
      const r = await invoke("export_diagnostics");
      setResult(r);
    } catch (e: any) {
      setResult({ success: false, message: String(e) });
    }
  };

  return (
    <div>
      <h2 style={styles.header}>Diagnostics</h2>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Export Diagnostic Bundle</div>
        <p style={{ fontSize: 13, color: "#888" }}>
          Creates a ZIP file with system info, dependency checks, port status, logs, and redacted config.
        </p>
        <div style={styles.btnGroup}>
          <button style={styles.btnPrimary} onClick={exportDiag}>Export Diagnostic Bundle</button>
        </div>
        {result && (
          <pre style={{ marginTop: 12, fontSize: 12 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── About ───

function About() {
  return (
    <div>
      <h2 style={styles.header}>About</h2>
      <div style={styles.card}>
        <div style={styles.cardTitle}>OpenAlice Desktop</div>
        <p style={{ fontSize: 13 }}>Version: v0.1.1-alpha.1</p>
        <p style={{ fontSize: 13, color: "#888" }}>
          A macOS desktop launcher for OpenAlice. Wraps TraderAlice/OpenAlice with
          environment checking, process management, log viewing, and diagnostic export.
        </p>
        <p style={{ fontSize: 13, color: "#888" }}>
          Repository:{" "}
          <a
            href="https://github.com/Dreaminmaster/openalice-desktop"
            style={{ color: "#8b5cf6" }}
          >
            github.com/Dreaminmaster/openalice-desktop
          </a>
        </p>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Implemented</div>
        <ul style={{ fontSize: 12, color: "#888", paddingLeft: 16 }}>
          <li>Tauri v2 desktop shell</li>
          <li>Environment check (Git, Node, npm, pnpm, Python, Claude, Codex)</li>
          <li>Port availability check</li>
          <li>Local directory initialization</li>
          <li>Configuration save/load</li>
          <li>Process start/stop/restart</li>
          <li>Real-time log viewing</li>
          <li>Diagnostic bundle export</li>
        </ul>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Not Yet Implemented</div>
        <ul style={{ fontSize: 12, color: "#888", paddingLeft: 16 }}>
          <li>Docker Mode</li>
          <li>Auto-install dependencies</li>
          <li>Real trading account integration</li>
          <li>Apple Developer ID signing</li>
          <li>Notarization</li>
        </ul>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Known Issues</div>
        <ul style={{ fontSize: 12, color: "#888", paddingLeft: 16 }}>
          <li>First launch may require right-click → Open (unsigned)</li>
          <li>Some dependencies require manual installation</li>
          <li>Native Mode depends on local environment</li>
          <li>OpenAlice must be cloned or selected manually</li>
        </ul>
      </div>
    </div>
  );
}

// ─── OpenAlice Management (v0.2.0) ───

function OpenAliceMgmt() {
  const [info, setInfo] = useState<any>(null);
  const [cloneMsg, setCloneMsg] = useState("");
  const [installMsg, setInstallMsg] = useState("");
  const [buildMsg, setBuildMsg] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async (path?: string) => {
    try {
      const r = await invoke("get_openalice_info", { oaPath: path || customPath || null });
      setInfo(r);
    } catch (e: any) {
      setInfo({ exists: false, message: String(e) });
    }
  };

  useEffect(() => { refresh(); }, []);

  const doClone = async () => {
    setLoading(true);
    setCloneMsg("Cloning...");
    try {
      const r = await invoke("clone_openalice", { targetPath: customPath || null });
      setCloneMsg(JSON.stringify(r));
      await refresh(customPath || undefined);
    } catch (e: any) {
      setCloneMsg("Error: " + e);
    }
    setLoading(false);
  };

  const doInstall = async () => {
    setLoading(true);
    setInstallMsg("Installing...");
    try {
      const r = await invoke("install_openalice_deps", { targetPath: customPath || info?.path || null });
      setInstallMsg(JSON.stringify(r));
      await refresh(customPath || info?.path || undefined);
    } catch (e: any) {
      setInstallMsg("Error: " + e);
    }
    setLoading(false);
  };

  const doBuild = async () => {
    setLoading(true);
    setBuildMsg("Building...");
    try {
      const r = await invoke("build_openalice", { targetPath: customPath || info?.path || null });
      setBuildMsg(JSON.stringify(r));
      await refresh(customPath || info?.path || undefined);
    } catch (e: any) {
      setBuildMsg("Error: " + e);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={styles.header}>OpenAlice Repository</h2>

      {/* Path selector */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Path</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder={info?.path || "Custom path (optional)"}
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
          />
          <button style={styles.btnPrimary} onClick={() => refresh(customPath || undefined)}>
            Check
          </button>
        </div>
      </div>

      {/* Info display */}
      {info && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Repository Info</div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>Exists</td>
                <td>{info.exists ? <span style={styles.badgeGreen}>✅</span> : <span style={styles.badgeRed}>❌</span>}</td>
              </tr>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>Git Repo</td>
                <td>{info.is_git_repo ? <span style={styles.badgeGreen}>✅</span> : <span style={styles.badgeRed}>❌</span>}</td>
              </tr>
              {info.branch && (
                <tr>
                  <td style={{ color: "#888", padding: "4px 0" }}>Branch</td>
                  <td><code>{info.branch}</code></td>
                </tr>
              )}
              {info.commit_short && (
                <tr>
                  <td style={{ color: "#888", padding: "4px 0" }}>Commit</td>
                  <td><code>{info.commit_short}</code></td>
                </tr>
              )}
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>package.json</td>
                <td>{info.has_package_json ? <span style={styles.badgeGreen}>✅</span> : <span style={styles.badgeRed}>❌</span>}</td>
              </tr>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>README.md</td>
                <td>{info.has_readme ? <span style={styles.badgeGreen}>✅</span> : <span style={styles.badgeRed}>❌</span>}</td>
              </tr>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>dist/</td>
                <td>{info.has_dist ? <span style={styles.badgeGreen}>✅ Built</span> : <span style={styles.badgeYellow}>⚠️ Not built</span>}</td>
              </tr>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>node_modules</td>
                <td>{info.has_node_modules ? <span style={styles.badgeGreen}>✅</span> : <span style={styles.badgeRed}>❌</span>}</td>
              </tr>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>Start Script</td>
                <td>{info.has_start_script ? <span style={styles.badgeGreen}>✅</span> : <span style={styles.badgeYellow}>⚠️</span>}</td>
              </tr>
              <tr>
                <td style={{ color: "#888", padding: "4px 0" }}>Status</td>
                <td>{info.message}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Action buttons */}
      <div style={styles.btnGroup}>
        <button style={styles.btnPrimary} onClick={doClone} disabled={loading}>
          Clone OpenAlice
        </button>
        <button style={styles.btnPrimary} onClick={doInstall} disabled={loading || !info?.exists}>
          Install Dependencies
        </button>
        <button style={styles.btnPrimary} onClick={doBuild} disabled={loading || !info?.has_node_modules}>
          Build OpenAlice
        </button>
      </div>

      {/* Messages */}
      {cloneMsg && <div style={{ ...styles.card, marginTop: 12 }}><pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{cloneMsg}</pre></div>}
      {installMsg && <div style={{ ...styles.card, marginTop: 12 }}><pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{installMsg}</pre></div>}
      {buildMsg && <div style={{ ...styles.card, marginTop: 12 }}><pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{buildMsg}</pre></div>}

      <div style={styles.card}>
        <div style={styles.cardTitle}>How it works</div>
        <ol style={{ fontSize: 12, color: "#888", paddingLeft: 16 }}>
          <li>Click <strong>Clone OpenAlice</strong> to download TraderAlice/OpenAlice</li>
          <li>Click <strong>Install Dependencies</strong> (requires pnpm)</li>
          <li>Click <strong>Build OpenAlice</strong> to compile the project</li>
          <li>Go to <strong>Runtime</strong> page to start the backend</li>
        </ol>
      </div>
    </div>
  );
}
}
