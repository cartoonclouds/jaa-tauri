use dotenvy::from_path_iter;
use std::path::PathBuf;

/// Loads workspace environment variables from the repository .env file.
pub fn load_workspace_env() {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let env_path = manifest_dir.join("..").join(".env");

    if let Ok(iter) = from_path_iter(&env_path) {
        for item in iter.flatten() {
            // Prefer the repo .env so the Rust runtime matches Nuxt during dev.
            std::env::set_var(item.0, item.1);
        }
    }
}
