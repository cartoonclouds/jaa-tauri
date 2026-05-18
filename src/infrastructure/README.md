# infrastructure

External integrations and technical adapters. All components are designed for cross-platform compatibility on Windows, macOS, and Linux.

Updated: 2026-05-18.

## Folders

- **http**: API clients.
- **tauri**: Tauri bridge wrappers for desktop APIs (notifications, dialogs, file system, shell).
- **persistence**: Local storage and SQLite database adapters.
- **logging**: Logging setup and wrappers.
- **config**: Runtime and environment configuration.

## Cross-Platform Notes

All infrastructure components are platform-agnostic:

- **Database**: Uses Tauri's SQLite plugin, which works identically on Windows, macOS, and Linux
- **Notifications**: Platform-native notifications via Tauri plugin (Windows Toast, macOS NSUserNotification, Linux D-Bus)
- **File System**: Abstracts platform differences through Tauri's file plugin
- **Shell**: Native shell commands via Tauri plugin (cmd.exe on Windows, sh on Unix-like systems)
- **Dialogs**: Platform-native file/message dialogs via Tauri plugin
- **Updater**: Cross-platform update checks and install flow through Tauri updater plugin
- **Window State**: Persist and restore window geometry through Tauri window-state plugin

## Migrations

SQL migrations are discovered from `src-tauri/migrations` at compile time in the Rust runtime. The same migrations run identically on all platforms since SQLite has consistent SQL syntax across platforms.
