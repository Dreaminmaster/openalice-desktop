use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

/// Environment check result for a single item
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CheckStatus {
    Ready,
    Warning,
    Missing,
    Error(String),
}

/// Result of checking a single dependency
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckItem {
    pub id: String,
    pub name: String,
    pub required: bool,
    pub status: CheckStatus,
    pub message: String,
    pub fix: Option<String>,
}

/// Overall environment check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentResult {
    pub overall: bool,
    pub items: Vec<CheckItem>,
    pub summary: String,
}

/// System info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_version: String,
    pub cpu_arch: String,
    pub ram_total_gb: f64,
    pub disk_available_gb: f64,
    pub hostname: String,
}

/// Application config
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub run_mode: RunMode,
    pub data_directory: String,
    pub default_agent: String,
    pub backend_port: u16,
    pub mcp_port: u16,
    pub ui_port: u16,
    pub trading_mode: TradingMode,
    pub allow_remote_access: bool,
    pub auto_restart: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RunMode {
    Native,
    Docker,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TradingMode {
    #[serde(rename = "research-only")]
    ResearchOnly,
    #[serde(rename = "paper-trading")]
    PaperTrading,
    #[serde(rename = "live-trading")]
    LiveTrading,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            run_mode: RunMode::Native,
            data_directory: dirs::home_dir()
                .unwrap_or_default()
                .join(".openalice-desktop")
                .to_string_lossy()
                .to_string(),
            default_agent: "claude".to_string(),
            backend_port: 47331,
            mcp_port: 47332,
            ui_port: 5173,
            trading_mode: TradingMode::ResearchOnly,
            allow_remote_access: false,
            auto_restart: true,
        }
    }
}

pub struct ConfigState(pub Mutex<AppConfig>);

impl AppConfig {
    pub fn load_or_default() -> Self {
        let config_path = dirs::home_dir()
            .map(|h| h.join(".openalice-desktop").join("config.json"))
            .unwrap_or_default();

        if config_path.exists() {
            if let Ok(content) = std::fs::read_to_string(&config_path) {
                if let Ok(config) = serde_json::from_str(&content) {
                    return config;
                }
            }
        }
        Self::default()
    }

    pub fn save(&self) -> Result<(), String> {
        let config_path = dirs::home_dir()
            .map(|h| h.join(".openalice-desktop").join("config.json"))
            .unwrap_or_default();

        std::fs::create_dir_all(config_path.parent().unwrap_or(&std::path::PathBuf::new()))
            .map_err(|e| e.to_string())?;

        serde_json::to_string_pretty(self)
            .and_then(|s| std::fs::write(&config_path, s).map_err(|e| e.to_string()))
            .map_err(|e| format!("Failed to save config: {}", e))
    }
}

/// Tauri command: check all environment dependencies
#[tauri::command]
pub async fn check_environment() -> EnvironmentResult {
    let mut items = Vec::new();

    // Check macOS version
    items.push(check_macos_version());

    // Check CPU architecture
    items.push(check_cpu_arch());

    // Check Git
    items.push(check_command("git", &["--version"], "Git", true));

    // Check Claude Code CLI
    items.push(check_command_optional("claude", &["--version"], "Claude Code CLI"));

    // Check Codex CLI
    items.push(check_command_optional("codex", &["--version"], "Codex CLI"));

    // Check node-pty availability
    items.push(check_node_pty());

    // Check port availability
    items.push(check_ports_available());

    // Check data directory writability
    items.push(check_data_directory_writable());

    let overall = items.iter().all(|item| {
        matches!(item.status, CheckStatus::Ready)
            || (!item.required && matches!(item.status, CheckStatus::Warning))
    });

    EnvironmentResult {
        overall,
        items,
        summary: if overall {
            "All required checks passed. You can start OpenAlice.".to_string()
        } else {
            "Some required checks failed. Please fix the issues below.".to_string()
        },
    }
}

/// Tauri command: get system information
#[tauri::command]
pub async fn get_system_info() -> SystemInfo {
    SystemInfo {
        os_version: get_os_version(),
        cpu_arch: get_cpu_arch(),
        ram_total_gb: get_ram_gb(),
        disk_available_gb: get_disk_available_gb(),
        hostname: get_hostname(),
    }
}

// --- Individual check implementations ---

fn check_macos_version() -> CheckItem {
    let version = get_os_version();
    // Parse major version
    let major = version
        .split('.')
        .next()
        .and_then(|s| s.trim().parse::<u32>().ok())
        .unwrap_or(0);

    if major >= 13 {
        CheckItem {
            id: "macos-version".to_string(),
            name: "macOS Version".to_string(),
            required: true,
            status: CheckStatus::Ready,
            message: format!("macOS {} — meets minimum requirement (13+)", version),
            fix: None,
        }
    } else {
        CheckItem {
            id: "macos-version".to_string(),
            name: "macOS Version".to_string(),
            required: true,
            status: CheckStatus::Error(format!("Requires macOS 13+, found {}", version)),
            message: "macOS version too old".to_string(),
            fix: Some("Upgrade to macOS 13 (Ventura) or later".to_string()),
        }
    }
}

fn check_cpu_arch() -> CheckItem {
    let arch = get_cpu_arch();
    if arch == "arm64" || arch == "x86_64" {
        CheckItem {
            id: "cpu-arch".to_string(),
            name: "CPU Architecture".to_string(),
            required: true,
            status: CheckStatus::Ready,
            message: format!("{} — supported", arch),
            fix: None,
        }
    } else {
        CheckItem {
            id: "cpu-arch".to_string(),
            name: "CPU Architecture".to_string(),
            required: true,
            status: CheckStatus::Error(format!("Unsupported architecture: {}", arch)),
            message: "Unsupported CPU architecture".to_string(),
            fix: Some("This app requires Apple Silicon (arm64) or Intel (x86_64)".to_string()),
        }
    }
}

fn check_command_optional(
    cmd: &str,
    args: &[&str],
    name: &str,
) -> CheckItem {
    let output = std::process::Command::new(cmd)
        .args(args)
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let version = String::from_utf8_lossy(&out.stdout).trim().to_string();
            CheckItem {
                id: format!("{}-cli", cmd),
                name: format!("{} CLI", name),
                required: false,
                status: CheckStatus::Ready,
                message: format!("{} detected", version),
                fix: None,
            }
        }
        _ => CheckItem {
            id: format!("{}-cli", cmd),
            name: format!("{} CLI", name),
            required: false,
            status: CheckStatus::Warning,
            message: format!("{} not found in PATH", cmd),
            fix: Some(format!("Install {} and ensure it is in PATH", name)),
        },
    }
}

fn check_command(
    cmd: &str,
    args: &[&str],
    name: &str,
    required: bool,
) -> CheckItem {
    let output = std::process::Command::new(cmd)
        .args(args)
        .output();

    match output {
        Ok(out) if out.status.success() => CheckItem {
            id: format!("{}-cmd", cmd),
            name: name.to_string(),
            required,
            status: CheckStatus::Ready,
            message: format!("{} detected", name),
            fix: None,
        },
        _ => CheckItem {
            id: format!("{}-cmd", cmd),
            name: name.to_string(),
            required,
            status: if required {
                CheckStatus::Error(format!("{} is required but not found", name))
            } else {
                CheckStatus::Warning(format!("{} not found", name))
            },
            message: format!("{} not found in PATH", name),
            fix: Some(format!("Install {} and ensure it is in PATH", name)),
        },
    }
}

fn check_node_pty() -> CheckItem {
    // Check if node-pty .node files exist in the bundled runtime
    CheckItem {
        id: "node-pty".to_string(),
        name: "node-pty".to_string(),
        required: false,
        status: CheckStatus::Warning,
        message: "node-pty will be verified at launch time".to_string(),
        fix: Some(
            "Build OpenAlice on the target architecture (arm64/x64)".to_string(),
        ),
    }
}

fn check_ports_available() -> CheckItem {
    CheckItem {
        id: "ports".to_string(),
        name: "Port Availability".to_string(),
        required: true,
        status: CheckStatus::Warning,
        message: "Port availability checked at runtime".to_string(),
        fix: None,
    }
}

fn check_data_directory_writable() -> CheckItem {
    let dir = dirs::home_dir()
        .map(|h| h.join(".openalice-desktop"))
        .unwrap_or_default();

    if dir.exists() {
        if std::fs::write(dir.join(".write_test"), "test").is_ok() {
            let _ = std::fs::remove_file(dir.join(".write_test"));
            CheckItem {
                id: "data-dir".to_string(),
                name: "Data Directory".to_string(),
                required: true,
                status: CheckStatus::Ready,
                message: format!("{} is writable", dir.display()),
                fix: None,
            }
        } else {
            CheckItem {
                id: "data-dir".to_string(),
                name: "Data Directory".to_string(),
                required: true,
                status: CheckStatus::Error("Directory is not writable".to_string()),
                message: "Data directory permission denied".to_string(),
                fix: Some("Check permissions for ~/.openalice-desktop".to_string()),
            }
        }
    } else {
        // Will be created at launch
        CheckItem {
            id: "data-dir".to_string(),
            name: "Data Directory".to_string(),
            required: true,
            status: CheckStatus::Ready,
            message: "Will be created at first launch".to_string(),
            fix: None,
        }
    }
}

// --- Platform helpers ---

fn get_os_version() -> String {
    // On macOS, use sw_vers
    let output = std::process::Command::new("sw_vers")
        .args(["-productVersion"])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            String::from_utf8_lossy(&out.stdout).trim().to_string()
        }
        _ => "unknown".to_string(),
    }
}

fn get_cpu_arch() -> String {
    let output = std::process::Command::new("uname")
        .args(["-m"])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            String::from_utf8_lossy(&out.stdout).trim().to_string()
        }
        _ => "unknown".to_string(),
    }
}

fn get_ram_gb() -> f64 {
    // sysctl hw.memsize on macOS
    let output = std::process::Command::new("sysctl")
        .args(["hw.memsize"])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let val = String::from_utf8_lossy(&out.stdout);
            val.split(':')
                .nth(1)
                .and_then(|s| s.trim().parse::<u64>().ok())
                .map(|bytes| bytes as f64 / (1024.0 * 1024.0 * 1024.0))
                .unwrap_or(0.0)
        }
        _ => 0.0,
    }
}

fn get_disk_available_gb() -> f64 {
    // statfs on macOS
    let home = dirs::home_dir().unwrap_or_default();
    let output = std::process::Command::new("df")
        .args(["-k", &home.to_string_lossy()])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let lines: Vec<&str> = String::from_utf8_lossy(&out.stdout)
                .lines()
                .skip(1)
                .collect();
            if let Some(line) = lines.first() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    parts[3]
                        .parse::<u64>()
                        .map(|kb| kb as f64 / 1024.0 / 1024.0)
                        .unwrap_or(0.0)
                } else {
                    0.0
                }
            } else {
                0.0
            }
        }
        _ => 0.0,
    }
}

fn get_hostname() -> String {
    std::env::var("HOSTNAME")
        .or_else(|_| std::env::var("COMPUTERNAME"))
        .unwrap_or_else(|_| "unknown".to_string())
}
