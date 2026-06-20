use chrono::Local;

/// Resolves log filename for file-based Tauri logging output.
pub fn resolve_log_file_name() -> String {
    if let Ok(value) = std::env::var("APP_LOG_FILE_NAME") {
        let trimmed = value.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }

    format!("{}.log", Local::now().format("%Y-%m-%d"))
}

/// Resolves runtime log level for Tauri logging plugin.
pub fn resolve_log_level() -> log::LevelFilter {
    let value = std::env::var("APP_LOG_LEVEL").unwrap_or_else(|_| "info".to_string());

    match value.trim().to_ascii_lowercase().as_str() {
        "off" => log::LevelFilter::Off,
        "error" => log::LevelFilter::Error,
        "warn" | "warning" => log::LevelFilter::Warn,
        "debug" => log::LevelFilter::Debug,
        "trace" => log::LevelFilter::Trace,
        "verbose" => log::LevelFilter::Info,
        _ => log::LevelFilter::Info,
    }
}
