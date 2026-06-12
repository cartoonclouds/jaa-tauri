fn parse_bool(value: &str) -> bool {
    matches!(
        value.trim().to_ascii_lowercase().as_str(),
        "1" | "true" | "yes" | "on"
    )
}

/// Resolves whether desktop runtime dev mode is enabled.
pub fn resolve_dev_mode() -> bool {
    if let Ok(value) = std::env::var("APP_DEV_MODE") {
        return parse_bool(&value);
    }

    cfg!(debug_assertions)
}
