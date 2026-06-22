use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::Mutex;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;

// ─── Path helpers ───

fn data_dir() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("OpenAlice Desktop")
}

fn config_dir() -> PathBuf {
    data_dir().join("config")
}

fn log_dir() -> PathBuf {
    data_dir().join("logs")
}

fn runtime_dir() -> PathBuf {
    data_dir().join("runtime")
}

fn diag_dir() -> PathBuf {
    data_dir().join("diagnostics")
}

fn openalice_dir() -> PathBuf {
    data_dir().join("openalice")
}

fn app_log_path() -> PathBuf {
    log_dir().join("app.log")
}

fn backend_log_path() -> PathBuf {
    log_dir().join("openalice-backend.log")
}

fn ui_log_path() -> PathBuf {
    log_dir().join("openalice-ui.log")
}

fn install_log_path() -> PathBuf {
    log_dir().join("install.log")
}

fn write_log(file: &PathBuf, msg: &str) {
    let ts = Utc::now().to_rfc3339();
    if let Ok(mut f) = fs::OpenOptions::new().create(true).append(true).open(file) {
        let _ = writeln!(f, "[{}] {}", ts, msg);
    }
}

fn sanitize(s: &str) -> String {
    let re = regex::Regex::new(r"(api[_-]?key|secret|token|password|Authorization: Bearer)\s*[:=]\s*\S+")
        .unwrap();
    re.replace_all(s, "$1=***REDACTED***").to_string()
}

// ─── Types ───

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepResult {
    pub name: String,
    pub installed: bool,
    pub version: Option<String>,
    pub path: Option<String>,
    pub message: String,
    pub fix_hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortCheck {
    pub port: u16,
    pub available: bool,
    pub used_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub mode: String,
    pub openalice_path: Option<String>,
    pub backend_port: u16,
    pub ui_port: u16,
    pub auto_start: bool,
    pub last_started_at: Option<String>,
    pub runtime_dir: String,
    pub log_dir: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            mode: "native".into(),
            openalice_path: Some(openalice_dir().to_string_lossy().to_string()),
            backend_port: 8000,
            ui_port: 3000,
            auto_start: false,
            last_started_at: None,
            runtime_dir: runtime_dir().to_string_lossy().to_string(),
            log_dir: log_dir().to_string_lossy().to_string(),
        }
    }
}

// ─── Command: get_app_status ───

#[tauri::command]
pub fn get_app_status(state: State<'_, Mutex<AppState>>) -> serde_json::Value {
    let guard = state.lock().unwrap();
    let running = guard.process_child.is_some();
    serde_json::json!({
        "running": running,
        "data_dir": data_dir().to_string_lossy(),
        "logs_exist": app_log_path().exists(),
        "config_exists": config_dir().join("config.json").exists(),
        "openalice_dir_exists": openalice_dir().exists(),
        "version": env!("CARGO_PKG_VERSION")
    })
}

// ─── Command: init_app_dirs ───

#[tauri::command]
pub fn init_app_dirs() -> serde_json::Value {
    let dirs_to_create = vec![
        config_dir(),
        log_dir(),
        runtime_dir(),
        diag_dir(),
        openalice_dir(),
    ];
    let mut created = vec![];
    for d in &dirs_to_create {
        if let Err(e) = fs::create_dir_all(d) {
            write_log(&app_log_path(), &format!("Failed to create dir {:?}: {}", d, e));
        } else {
            created.push(d.to_string_lossy().to_string());
        }
    }
    write_log(&app_log_path(), "Directories initialized");
    serde_json::json!({ "created": created, "base": data_dir().to_string_lossy() })
}

// ─── Command: check_system_dependencies ───

#[tauri::command]
pub fn check_system_dependencies() -> Vec<DepResult> {
    let checks = vec![
        ("git", &["--version"][..]),
        ("node", &["--version"]),
        ("npm", &["--version"]),
        ("pnpm", &["--version"]),
        ("python3", &["--version"]),
        ("claude", &["--version"]),
        ("codex", &["--version"]),
    ];

    let mut results = Vec::new();
    for (cmd, args) in checks {
        let output = Command::new(cmd).args(args).output();
        match output {
            Ok(out) if out.status.success() => {
                let ver = String::from_utf8_lossy(&out.stdout).trim().to_string();
                let path_out = Command::new("which").arg(cmd).output();
                let path = path_out
                    .ok()
                    .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());
                results.push(DepResult {
                    name: cmd.to_string(),
                    installed: true,
                    version: Some(ver),
                    path,
                    message: format!("{} detected", cmd),
                    fix_hint: None,
                });
            }
            _ => {
                results.push(DepResult {
                    name: cmd.to_string(),
                    installed: false,
                    version: None,
                    path: None,
                    message: format!("{} not found in PATH", cmd),
                    fix_hint: Some(format!("Install {} or ensure it is in PATH", cmd)),
                });
            }
        }
    }
    write_log(&app_log_path(), "System dependency check completed");
    results
}

// ─── Command: check_ports ───

#[tauri::command]
pub fn check_ports() -> Vec<PortCheck> {
    let ports = vec![8000, 3000, 3001, 5173, 47331];
    let mut results = Vec::new();
    for port in ports {
        let listener = std::net::TcpListener::bind(("127.0.0.1", port));
        match listener {
            Ok(_) => {
                results.push(PortCheck {
                    port,
                    available: true,
                    used_by: None,
                });
            }
            Err(e) => {
                // Try to find what's using it
                let used = format!("{:?}", e);
                results.push(PortCheck {
                    port,
                    available: false,
                    used_by: Some(used),
                });
            }
        }
    }
    write_log(&app_log_path(), "Port check completed");
    results
}

// ─── Command: start_openalice ───

#[tauri::command]
pub fn start_openalice(state: State<'_, Mutex<AppState>>, target_path: Option<String>, backend_port: Option<u16>) -> serde_json::Value {
    write_log(&app_log_path(), "Attempting to start OpenAlice...");
    let mut guard = state.lock().unwrap();

    if guard.process_child.is_some() {
        write_log(&app_log_path(), "Cannot start: process already running");
        return serde_json::json!({ "success": false, "message": "Process already running" });
    }

    let oa_dir = target_path.map(PathBuf::from).unwrap_or_else(|| openalice_dir());

    if !oa_dir.exists() || !oa_dir.join("package.json").exists() {
        write_log(&app_log_path(), "OpenAlice directory not found or incomplete");
        return serde_json::json!({
            "success": false,
            "message": "OpenAlice directory not found. Please clone or select OpenAlice path.",
            "expected_path": oa_dir.to_string_lossy()
        });
    }

    let port = backend_port.unwrap_or(8000);
    // Check port
    if !std::net::TcpListener::bind(("127.0.0.1", port)).is_ok() {
        return serde_json::json!({
            "success": false,
            "message": format!("Port {} is already in use. Please stop the conflicting process or change the port in Settings.", port)
        });
    }

    let child = Command::new("node")
        .arg("dist/main.js")
        .current_dir(&oa_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();

    match child {
        Ok(c) => {
            let pid = c.id();
            guard.process_child = Some(c);
            write_log(&app_log_path(), &format!("OpenAlice started with PID {} on port {}", pid, port));
            serde_json::json!({ "success": true, "message": "OpenAlice started", "pid": pid, "port": port })
        }
        Err(e) => {
            write_log(&app_log_path(), &format!("Failed to start OpenAlice: {}", e));
            serde_json::json!({ "success": false, "message": format!("Failed to start: {}", e) })
        }
    }
}

// ─── Command: stop_openalice ───

#[tauri::command]
pub fn stop_openalice(state: State<'_, Mutex<AppState>>, force: Option<bool>) -> serde_json::Value {
    write_log(&app_log_path(), "Stopping OpenAlice...");
    let mut guard = state.lock().unwrap();

    if let Some(mut child) = guard.process_child.take() {
        let pid = child.id();
        if force.unwrap_or(false) || child.kill().is_err() {
            // Force kill via system command
            let _ = Command::new("kill").arg("-9").arg(pid.to_string()).output();
        }
        let _ = child.wait();
        write_log(&app_log_path(), &format!("OpenAlice (PID {}) stopped", pid));
        serde_json::json!({ "success": true, "message": "Stopped", "pid": pid })
    } else {
        serde_json::json!({ "success": false, "message": "No process running" })
    }
}

// ─── Command: restart_openalice ───

#[tauri::command]
pub fn restart_openalice(state: State<'_, Mutex<AppState>>) -> serde_json::Value {
    let _ = stop_openalice(state.clone(), Some(true));
    std::thread::sleep(std::time::Duration::from_secs(2));
    start_openalice(state, None, None)
}

// ─── Command: open_web_ui ───

#[tauri::command]
pub fn open_web_ui(ui_port: Option<u16>) -> serde_json::Value {
    let port = ui_port.unwrap_or(3000);
    let url = format!("http://127.0.0.1:{}", port);
    let result = Command::new("open").arg(&url).output();
    match result {
        Ok(_) => serde_json::json!({ "success": true, "url": url }),
        Err(e) => serde_json::json!({ "success": false, "message": format!("{}", e) }),
    }
}

// ─── Command: reveal_runtime_folder ───

#[tauri::command]
pub fn reveal_runtime_folder() -> serde_json::Value {
    let path = openalice_dir();
    let result = Command::new("open").arg(&path).output();
    match result {
        Ok(_) => serde_json::json!({ "success": true, "path": path.to_string_lossy() }),
        Err(e) => serde_json::json!({ "success": false, "message": format!("{}", e) }),
    }
}

// ─── Command: get_process_status ───

#[tauri::command]
pub fn get_process_status(state: State<'_, Mutex<AppState>>) -> serde_json::Value {
    let guard = state.lock().unwrap();
    serde_json::json!({
        "running": guard.process_child.is_some(),
        "pid": guard.process_child.as_ref().map(|c| c.id()),
        "openalice_dir_exists": openalice_dir().exists(),
        "openalice_package_json": openalice_dir().join("package.json").exists(),
    })
}

// ─── Command: tail_openalice_logs ───

#[tauri::command]
pub fn tail_openalice_logs(log_type: String, lines: Option<usize>) -> String {
    let path = match log_type.as_str() {
        "app" => app_log_path(),
        "backend" => backend_log_path(),
        "ui" => ui_log_path(),
        _ => app_log_path(),
    };

    if !path.exists() {
        return "[No log file yet]".to_string();
    }

    let n = lines.unwrap_or(100);
    if let Ok(file) = fs::File::open(&path) {
        let reader = BufReader::new(file);
        let all_lines: Vec<String> = reader.lines().filter_map(|l| l.ok()).collect();
        let start = if all_lines.len() > n { all_lines.len() - n } else { 0 };
        all_lines[start..].join("\n")
    } else {
        "[Error reading log]".to_string()
    }
}

// ─── Command: save_config ───

#[tauri::command]
pub fn save_config(config: AppConfig) -> serde_json::Value {
    let dir = config_dir();
    let _ = fs::create_dir_all(&dir);
    let path = dir.join("config.json");

    let json = serde_json::to_string_pretty(&config).unwrap_or_default();
    match fs::write(&path, json) {
        Ok(_) => serde_json::json!({ "success": true, "path": path.to_string_lossy() }),
        Err(e) => serde_json::json!({ "success": false, "message": e.to_string() }),
    }
}

// ─── Command: load_config ───

#[tauri::command]
pub fn load_config() -> AppConfig {
    let path = config_dir().join("config.json");
    if let Ok(content) = fs::read_to_string(&path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

// ─── Command: export_diagnostics ───

#[tauri::command]
pub fn export_diagnostics() -> serde_json::Value {
    let dir = diag_dir();
    let _ = fs::create_dir_all(&dir);
    let ts = Utc::now().format("%Y%m%d-%H%M%S");
    let zip_name = format!("diagnostics-{}.zip", ts);
    let zip_path = dir.join(&zip_name);

    // Collect data
    let system_info = serde_json::json!({
        "hostname": hostname(),
        "os": os_info(),
        "arch": std::env::consts::ARCH,
        "timestamp": ts.to_string(),
        "app_version": env!("CARGO_PKG_VERSION")
    });

    let deps = check_system_dependencies();
    let ports = check_ports();

    let config = if config_dir().join("config.json").exists() {
        let raw = fs::read_to_string(config_dir().join("config.json")).unwrap_or_default();
        sanitize(&raw)
    } else {
        "{}".into()
    };

    let openalice_info = serde_json::json!({
        "path": openalice_dir().to_string_lossy(),
        "exists": openalice_dir().exists(),
        "has_package_json": openalice_dir().join("package.json").exists(),
        "has_dist": openalice_dir().join("dist").exists(),
    });

    // Write individual files then create zip
    let tmp = dir.join(format!("diag-tmp-{}", ts));
    let _ = fs::create_dir_all(&tmp);

    let _ = fs::write(tmp.join("system-info.json"), serde_json::to_string_pretty(&system_info).unwrap_or_default());
    let _ = fs::write(
        tmp.join("dependency-check.json"),
        serde_json::to_string_pretty(&deps).unwrap_or_default(),
    );
    let _ = fs::write(
        tmp.join("port-check.json"),
        serde_json::to_string_pretty(&ports).unwrap_or_default(),
    );
    let _ = fs::write(tmp.join("config-redacted.json"), config);
    let _ = fs::write(
        tmp.join("openalice-upstream.json"),
        serde_json::to_string_pretty(&openalice_info).unwrap_or_default(),
    );

    // Copy logs
    for log_file in &["app.log", "openalice-backend.log", "openalice-ui.log"] {
        let src = log_dir().join(log_file);
        if src.exists() {
            if let Ok(content) = fs::read_to_string(&src) {
                let _ = fs::write(tmp.join(log_file), sanitize(&content));
            }
        }
    }

    // Create zip using macOS zip command
    let output = Command::new("zip")
        .arg("-r")
        .arg(&zip_path)
        .arg(".")
        .current_dir(&tmp)
        .output();

    let _ = fs::remove_dir_all(&tmp);

    match output {
        Ok(out) if out.status.success() => serde_json::json!({
            "success": true,
            "path": zip_path.to_string_lossy(),
            "size": fs::metadata(&zip_path).map(|m| m.len()).unwrap_or(0)
        }),
        _ => {
            // Fallback: just return the file paths
            serde_json::json!({
                "success": true,
                "message": "Zip failed, files in diagnostics directory",
                "dir": dir.to_string_lossy()
            })
        }
    }
}

// ─── Helpers ───

fn hostname() -> String {
    Command::new("hostname")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "unknown".into())
}

fn os_info() -> String {
    Command::new("sw_vers")
        .arg("-productVersion")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "unknown".into())
}

// ──────────────────────────────────────────────
// v0.2.0: OpenAlice Repository Management
// ──────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAliceInfo {
    pub path: String,
    pub exists: bool,
    pub is_git_repo: bool,
    pub branch: Option<String>,
    pub commit: Option<String>,
    pub commit_short: Option<String>,
    pub has_package_json: bool,
    pub has_readme: bool,
    pub has_dist: bool,
    pub has_node_modules: bool,
    pub has_start_script: bool,
    pub pnpm_lock_exists: bool,
    pub message: String,
}

#[tauri::command]
pub fn get_openalice_info(oa_path: Option<String>) -> OpenAliceInfo {
    let path_str = oa_path.unwrap_or_else(|| openalice_dir().to_string_lossy().to_string());
    let path = PathBuf::from(&path_str);

    let exists = path.exists();
    if !exists {
        return OpenAliceInfo {
            path: path_str,
            exists: false,
            is_git_repo: false,
            branch: None,
            commit: None,
            commit_short: None,
            has_package_json: false,
            has_readme: false,
            has_dist: false,
            has_node_modules: false,
            has_start_script: false,
            pnpm_lock_exists: false,
            message: "OpenAlice directory does not exist".into(),
        };
    }

    let is_git = path.join(".git").exists();
    let branch = if is_git {
        Command::new("git")
            .args(["rev-parse", "--abbrev-ref", "HEAD"])
            .current_dir(&path)
            .output()
            .ok()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
    } else {
        None
    };

    let commit = if is_git {
        Command::new("git")
            .args(["rev-parse", "HEAD"])
            .current_dir(&path)
            .output()
            .ok()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
    } else {
        None
    };

    let commit_short = commit.as_ref().map(|c| c[..8.min(c.len())].to_string());

    let has_pj = path.join("package.json").exists();
    let has_rm = path.join("README.md").exists();
    let has_d = path.join("dist").exists();
    let has_nm = path.join("node_modules").exists();
    let has_ss = if has_pj {
        // Check if "start" or "dev" script exists in package.json
        fs::read_to_string(path.join("package.json"))
            .map(|s| s.contains("\"start\"") || s.contains("\"dev\""))
            .unwrap_or(false)
    } else {
        false
    };
    let has_pl = path.join("pnpm-lock.yaml").exists();

    OpenAliceInfo {
        path: path_str,
        exists: true,
        is_git_repo: is_git,
        branch,
        commit,
        commit_short,
        has_package_json: has_pj,
        has_readme: has_rm,
        has_dist: has_d,
        has_node_modules: has_nm,
        has_start_script: has_ss,
        pnpm_lock_exists: has_pl,
        message: if has_pj && has_d && has_nm {
            "OpenAlice appears ready to run".into()
        } else if has_pj {
            "OpenAlice source found, but may need build".into()
        } else {
            "Directory exists but does not appear to be OpenAlice".into()
        },
    }
}

#[tauri::command]
pub fn clone_openalice(target_path: Option<String>) -> serde_json::Value {
    let path_str = target_path.unwrap_or_else(|| openalice_dir().to_string_lossy().to_string());
    let path = PathBuf::from(&path_str);

    write_log(&app_log_path(), &format!("Cloning OpenAlice to {}", path_str));

    // Create parent dirs
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    // Remove existing if present
    if path.exists() {
        let _ = fs::remove_dir_all(&path);
    }

    let output = Command::new("git")
        .args(["clone", "--depth", "1", "https://github.com/TraderAlice/OpenAlice.git", &path_str])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            write_log(&app_log_path(), "OpenAlice cloned successfully");
            write_log(&install_log_path(), &format!(
                "Clone stdout: {}",
                String::from_utf8_lossy(&out.stdout).trim()
            ));
            serde_json::json!({
                "success": true,
                "path": path_str,
                "message": "OpenAlice cloned successfully"
            })
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            write_log(&app_log_path(), &format!("Clone failed: {}", stderr));
            write_log(&install_log_path(), &format!("Clone stderr: {}", stderr));
            serde_json::json!({
                "success": false,
                "message": format!("Clone failed: {}", stderr)
            })
        }
        Err(e) => {
            write_log(&app_log_path(), &format!("Clone error: {}", e));
            serde_json::json!({
                "success": false,
                "message": format!("Clone error: {}", e)
            })
        }
    }
}

#[tauri::command]
pub fn install_openalice_deps(target_path: Option<String>) -> serde_json::Value {
    let path_str = target_path.unwrap_or_else(|| openalice_dir().to_string_lossy().to_string());
    let path = PathBuf::from(&path_str);

    if !path.join("package.json").exists() {
        return serde_json::json!({
            "success": false,
            "message": "package.json not found — is OpenAlice cloned here?"
        });
    }

    write_log(&app_log_path(), &format!("Installing OpenAlice dependencies in {}", path_str));
    write_log(&install_log_path(), "Starting pnpm install...");

    // Try pnpm first, then npm
    let output = Command::new("pnpm")
        .args(["install"])
        .current_dir(&path)
        .output();

    let result = match output {
        Ok(out) if out.status.success() => {
            write_log(&install_log_path(), "pnpm install succeeded");
            serde_json::json!({ "success": true, "method": "pnpm", "message": "Dependencies installed with pnpm" })
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            write_log(&install_log_path(), &format!("pnpm install failed, trying npm: {}", stderr));
            // Fallback to npm
            let npm_out = Command::new("npm")
                .args(["install"])
                .current_dir(&path)
                .output();
            match npm_out {
                Ok(no) if no.status.success() => {
                    write_log(&install_log_path(), "npm install succeeded");
                    serde_json::json!({ "success": true, "method": "npm", "message": "Dependencies installed with npm (pnpm failed)" })
                }
                Ok(no) => {
                    let e = String::from_utf8_lossy(&no.stderr).to_string();
                    write_log(&install_log_path(), &format!("npm install also failed: {}", e));
                    serde_json::json!({ "success": false, "message": format!("Both pnpm and npm install failed. Last error: {}", e) })
                }
                Err(e) => {
                    serde_json::json!({ "success": false, "message": format!("npm install error: {}", e) })
                }
            }
        }
        Err(e) => {
            serde_json::json!({ "success": false, "message": format!("pnpm not found: {}", e), "fix_hint": "Install pnpm: npm install -g pnpm" })
        }
    };

    result
}

#[tauri::command]
pub fn build_openalice(target_path: Option<String>) -> serde_json::Value {
    let path_str = target_path.unwrap_or_else(|| openalice_dir().to_string_lossy().to_string());
    let path = PathBuf::from(&path_str);

    if !path.join("package.json").exists() {
        return serde_json::json!({
            "success": false,
            "message": "package.json not found — is OpenAlice cloned here?"
        });
    }

    if !path.join("node_modules").exists() {
        return serde_json::json!({
            "success": false,
            "message": "node_modules not found — install dependencies first"
        });
    }

    write_log(&app_log_path(), &format!("Building OpenAlice in {}", path_str));

    let output = Command::new("pnpm")
        .args(["build"])
        .current_dir(&path)
        .output();

    match output {
        Ok(out) if out.status.success() => {
            write_log(&app_log_path(), "OpenAlice build succeeded");
            serde_json::json!({ "success": true, "message": "Build successful" })
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            serde_json::json!({ "success": false, "message": format!("Build failed: {}", stderr) })
        }
        Err(e) => {
            serde_json::json!({ "success": false, "message": format!("Build error: {}", e) })
        }
    }
}
