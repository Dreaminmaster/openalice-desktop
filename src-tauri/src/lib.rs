mod commands;

use std::sync::Mutex;

pub struct AppState {
    pub process_child: Option<std::process::Child>,
}

pub fn run() {
    env_logger::init();

    let state = AppState {
        process_child: None,
    };

    tauri::Builder::default()
        .manage(Mutex::new(state))
        .invoke_handler(tauri::generate_handler![
            commands::get_app_status,
            commands::init_app_dirs,
            commands::check_system_dependencies,
            commands::check_ports,
            commands::start_openalice,
            commands::stop_openalice,
            commands::restart_openalice,
            commands::get_process_status,
            commands::open_web_ui,
            commands::reveal_runtime_folder,
            commands::tail_openalice_logs,
            commands::save_config,
            commands::load_config,
            commands::export_diagnostics,
            // v0.2: OpenAlice repo management
            commands::get_openalice_info,
            commands::clone_openalice,
            commands::install_openalice_deps,
            commands::build_openalice,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
