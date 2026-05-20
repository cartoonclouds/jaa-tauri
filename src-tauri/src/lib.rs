use include_dir::{include_dir, Dir};
use tauri_plugin_sql::{Migration, MigrationKind};

/// Compile-time embedded SQL migrations folder.
///
/// Keeping migrations embedded ensures desktop builds always ship with
/// the exact migration set used by the binary.
static MIGRATIONS_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/migrations");

fn parse_bool(value: &str) -> bool {
    matches!(
        value.trim().to_ascii_lowercase().as_str(),
        "1" | "true" | "yes" | "on"
    )
}

fn resolve_database_url() -> String {
    if let Ok(explicit_url) = std::env::var("APP_DATABASE_URL") {
        if !explicit_url.trim().is_empty() {
            return explicit_url;
        }
    }

    let driver = std::env::var("APP_DATABASE_DRIVER").unwrap_or_else(|_| "sqlite".to_string());
    let name = std::env::var("APP_DATABASE_NAME").unwrap_or_else(|_| "jaa.db".to_string());

    if driver == "memory" || driver == "in-memory" {
        ":memory:".to_string()
    } else {
        format!("{}:{}", driver, name)
    }
}

fn resolve_dev_mode() -> bool {
    if let Ok(value) = std::env::var("APP_DEV_MODE") {
        return parse_bool(&value);
    }

    cfg!(debug_assertions)
}

/// Discovers and builds SQL migrations from embedded files.
///
/// Expected filename format starts with a numeric version prefix, for example:
/// `0001_create_projects.sql`.
///
/// The full filename is used as the migration description to preserve clear
/// traceability between migration records and source files.
fn discover_migrations() -> Vec<Migration> {
    let mut entries: Vec<(i64, &'static str, &'static str)> = MIGRATIONS_DIR
        .files()
        .filter_map(|file| {
            let file_name = file.path().file_name()?.to_str()?;
            let sql = file.contents_utf8()?;

            if !file_name.ends_with(".sql") {
                return None;
            }

            let version_str = file_name.split(['_', '.']).next()?;
            let version = version_str.parse::<i64>().ok()?;

            Some((version, file_name, sql))
        })
        .collect();

    entries.sort_by_key(|(version, name, _)| (*version, *name));

    entries
        .into_iter()
        .map(|(version, file_name, sql)| Migration {
            version,
            description: file_name,
            sql,
            kind: MigrationKind::Up,
        })
        .collect()
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
    use tauri::{
        menu::{Menu, MenuItem},
        tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
        Manager, WindowEvent,
    };

    // 1) Discover embedded SQL migrations and pass them to the SQL plugin.
    let migrations = discover_migrations();
    let database_url = resolve_database_url();

    // 2) Build and configure the Tauri application runtime.
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        // Persistence and native capability plugins.
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
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
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show, &quit])?;

            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();

                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Open devtools in debug mode for easier development and debugging.
            app.manage(tray);

            if resolve_dev_mode() {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
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
