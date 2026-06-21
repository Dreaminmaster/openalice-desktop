mod diagnostics;
mod launcher;
mod logs;
mod ports;

use tauri::Manager;

#[tokio::main]
async fn main() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize log directory
            let log_dir = app.path().log_dir()?;
            std::fs::create_dir_all(&log_dir).ok();

            // Load persisted config
            let config = diagnostics::Config::load_or_default();
            app.state::<tauri::State<diagnostics::ConfigState>>()
                .inner
                .clone_from(&config);

            log::info!("OpenAlice Desktop v{} started", env!("CARGO_PKG_VERSION"));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Diagnostics
            diagnostics::check_environment,
            diagnostics::get_system_info,
            // Launcher
            launcher::start_openalice,
            launcher::stop_openalice,
            launcher::restart_openalice,
            launcher::get_status,
            // Ports
            ports::resolve_port,
            ports::check_port,
            // Logs
            logs::read_logs,
            logs::export_diagnostic_bundle,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
