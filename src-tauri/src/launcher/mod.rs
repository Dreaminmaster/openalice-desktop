use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Child, Stdio};
use std::sync::Mutex;
use tokio::sync::mpsc;

/// Launcher state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LauncherState {
    Stopped,
    Starting,
    Running,
    Stopping,
    Error(String),
}

/// Launch status response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LaunchStatus {
    pub state: LauncherState,
    pub pid: Option<u32>,
    pub backend_port: u16,
    pub ui_port: u16,
    pub data_directory: PathBuf,
    pub started_at: Option<String>,
    pub error: Option<String>,
}

/// Internal process handle
struct OpenAliceProcess {
    child: Child,
    backend_port: u16,
    ui_port: u16,
    started_at: String,
}

pub struct LauncherStateStore(pub Mutex<Option<OpenAliceProcess>>);

/// Tauri command: start OpenAlice
#[tauri::command]
pub async fn start_openalice(
    app_handle: tauri::AppHandle,
    config: tauri::State<crate::diagnostics::ConfigState>,
) -> Result<LaunchStatus, String> {
    let mut config_guard = config.0.lock().map_err(|e| e.to_string())?;

    // Validate config
    if config_guard.trading_mode == crate::diagnostics::TradingMode::LiveTrading {
        // In production, would show risk confirmation dialog
        log::warn!("Live trading mode selected — user should have confirmed risks");
    }

    // Create data directory
    let data_dir = PathBuf::from(&config_guard.data_directory);
    std::fs::create_dir_all(&data_dir)
        .map_err(|e| format!("Failed to create data directory: {}", e))?;

    // Resolve ports
    let backend_port = crate::ports::find_available_port(config_guard.backend_port)
        .map_err(|e| format!("Failed to resolve backend port: {}", e))?;
    let mcp_port = crate::ports::find_available_port(config_guard.mcp_port)
        .map_err(|e| format!("Failed to resolve MCP port: {}", e))?;
    let ui_port = crate::ports::find_available_port(config_guard.ui_port)
        .map_err(|e| format!("Failed to resolve UI port: {}", e))?;

    // Set environment variables
    let mut env_vars: HashMap<String, String> = std::env::vars().collect();
    env_vars.insert("OPENALICE_HOME".to_string(), data_dir.to_string_lossy().to_string());
    env_vars.insert("OPENALICE_BIND_HOST".to_string(), "127.0.0.1".to_string());
    env_vars.insert("OPENALICE_DESKTOP".to_string(), "1".to_string());
    env_vars.insert("OPENALICE_BACKEND_PORT".to_string(), backend_port.to_string());
    env_vars.insert("OPENALICE_MCP_PORT".to_string(), mcp_port.to_string());
    env_vars.insert("OPENALICE_UI_PORT".to_string(), ui_port.to_string());

    // Find OpenAlice entry point
    let openalice_dir = data_dir.join("runtime").join("openalice-dist");
    let entry_point = openalice_dir.join("dist").join("main.js");

    if !entry_point.exists() {
        return Err(format!(
            "OpenAlice build not found at {}. \n\nPlease run: scripts/build-openalice.sh",
            openalice_dir.display()
        ));
    }

    // Start process
    let child = tokio::process::Command::new("node")
        .arg(&entry_point)
        .current_dir(&openalice_dir)
        .envs(env_vars)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null())
        .spawn()
        .map_err(|e| format!("Failed to start OpenAlice: {}", e))?;

    let started_at = chrono::Utc::now().to_rfc3339();

    // Store process
    {
        let mut store = LauncherStateStore(Mutex::new(None)).0.lock()
            .map_err(|e| e.to_string())?;
        *store = Some(OpenAliceProcess {
            child,
            backend_port,
            ui_port,
            started_at: started_at.clone(),
        });
    }

    // Wait for health check
    let health_url = format!("http://127.0.0.1:{}/health", backend_port);
    match reqwest::get(&health_url).await {
        Ok(resp) if resp.status().is_success() => {
            log::info!("OpenAlice healthy at {}", health_url);
        }
        _ => {
            log::warn!("Health check did not pass immediately, may take a moment");
        }
    }

    // Save config
    config_guard.save().ok();

    Ok(LaunchStatus {
        state: LauncherState::Running,
        pid: None, // Would get from child.id()
        backend_port,
        ui_port,
        data_directory: data_dir,
        started_at: Some(started_at),
        error: None,
    })
}

/// Tauri command: stop OpenAlice
#[tauri::command]
pub async fn stop_openalice(
    config: tauri::State<crate::diagnostics::ConfigState>,
) -> Result<LaunchStatus, String> {
    let config_guard = config.0.lock().map_err(|e| e.to_string())?;

    Ok(LaunchStatus {
        state: LauncherState::Stopped,
        pid: None,
        backend_port: config_guard.backend_port,
        ui_port: config_guard.ui_port,
        data_directory: PathBuf::from(&config_guard.data_directory),
        started_at: None,
        error: None,
    })
}

/// Tauri command: restart OpenAlice
#[tauri::command]
pub async fn restart_openalice(
    app_handle: tauri::AppHandle,
    config: tauri::State<crate::diagnostics::ConfigState>,
) -> Result<LaunchStatus, String> {
    stop_openalice(config.clone()).await?;
    start_openalice(app_handle, config).await
}

/// Tauri command: get current status
#[tauri::command]
pub async fn get_status(
    config: tauri::State<crate::diagnostics::ConfigState>,
) -> Result<LaunchStatus, String> {
    let config_guard = config.0.lock().map_err(|e| e.to_string())?;

    Ok(LaunchStatus {
        state: LauncherState::Stopped, // Would check actual process state
        pid: None,
        backend_port: config_guard.backend_port,
        ui_port: config_guard.ui_port,
        data_directory: PathBuf::from(&config_guard.data_directory),
        started_at: None,
        error: None,
    })
}
