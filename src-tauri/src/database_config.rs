use std::path::PathBuf;

/// Resolves SQL plugin connection URL from runtime environment.
pub fn resolve_database_url() -> String {
    if let Ok(explicit_url) = std::env::var("APP_DATABASE_URL") {
        if !explicit_url.trim().is_empty() {
            return explicit_url;
        }
    }

    let driver = std::env::var("APP_DATABASE_DRIVER").unwrap_or_else(|_| "sqlite".to_string());
    let name = std::env::var("APP_DATABASE_NAME").unwrap_or_else(|_| "applyflow.db".to_string());
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_db = manifest_dir.join("..").join(&name);

    if driver == "memory" || driver == "in-memory" {
        ":memory:".to_string()
    } else {
        format!("{}:{}", driver, workspace_db.to_string_lossy())
    }
}
