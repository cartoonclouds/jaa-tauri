use include_dir::{include_dir, Dir};
use tauri_plugin_sql::{Migration, MigrationKind};

/// Compile-time embedded SQL migrations folder.
///
/// Keeping migrations embedded ensures desktop builds always ship with
/// the exact migration set used by the binary.
static MIGRATIONS_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/migrations");

/// Normalize SQL text to a stable LF format across platforms.
fn normalize_sql(sql: &str) -> String {
    sql.replace("\r\n", "\n").replace('\r', "\n")
}

/// Discovers and builds SQL migrations from embedded files.
///
/// Expected filename format starts with a numeric version prefix, for example:
/// `0001_create_projects.sql`.
///
/// The full filename is used as the migration description to preserve clear
/// traceability between migration records and source files.
pub fn discover_migrations() -> Vec<Migration> {
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

            let normalized_sql = Box::leak(normalize_sql(sql).into_boxed_str());

            Some((version, file_name, normalized_sql as &'static str))
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
