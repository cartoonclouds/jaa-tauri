mod database_config;
mod dev_mode;
mod env_loader;
mod logging_config;
mod migrations;
mod resume_parsing;
mod window;

use database_config::resolve_database_url;
use dev_mode::resolve_dev_mode;
use env_loader::load_workspace_env;
use logging_config::{resolve_log_file_name, resolve_log_level};
use migrations::discover_migrations;
use resume_parsing::parse_resume_for_ats;
use window::{close_splashscreen, hide_main_window, setup_tray};

/// Exits the desktop application process.
#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

/// Application entry point for desktop/mobile Tauri runtime.
///
/// Sections:
/// - Build migration list from embedded SQL files.
/// - Initialize Tauri plugins (storage, dialogs, fs, logging, shell, SQL, updater, notifications).
/// - Configure system tray menu behavior.
/// - Hide window to tray when minimized.
/// - Start the Tauri event loop.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::WindowEvent;

    load_workspace_env();

    // 1) Discover embedded SQL migrations and pass them to the SQL plugin.
    let migrations = discover_migrations();
    let database_url = resolve_database_url();
    let log_level = resolve_log_level();
    let log_file_name = resolve_log_file_name();

    // 2) Build and configure the Tauri application runtime.
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            parse_resume_for_ats,
            hide_main_window,
            close_splashscreen,
            exit_app
        ])
        .plugin(
            tauri_plugin_window_state::Builder::new()
                // Keep geometry restoration but never auto-restore visibility.
                .with_state_flags(
                    tauri_plugin_window_state::StateFlags::all()
                        & !tauri_plugin_window_state::StateFlags::VISIBLE,
                )
                .build(),
        )
        // Persistence and native capability plugins.
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log_level)
                .clear_targets()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some(log_file_name),
                    },
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Webview,
                ))
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        // SQL plugin with discovered migrations for schema evolution.
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(database_url.as_str(), migrations)
                .build(),
        )
        // Application updater support.
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Desktop notifications.
        .plugin(tauri_plugin_notification::init())
        // 3) Configure tray icon and tray menu actions.
        .setup(|app| Ok(setup_tray(app, resolve_dev_mode())?))
        // 4) Minimize-to-tray behavior: hide window only when minimized.
        .on_window_event(|window, event| {
            if let WindowEvent::Resized(_) = event {
                if let Ok(true) = window.is_minimized() {
                    let _ = window.hide();
                }
            }
        })
        // 5) Start event loop.
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
