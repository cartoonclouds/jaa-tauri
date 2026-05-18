# Tauri Desktop Runtime

This directory contains the Rust-based Tauri 2 desktop runtime and configuration for the Job Application Auditor desktop application.

Updated: 2026-05-18.

## Structure

- **src/**: Rust source code for the desktop runtime
  - `main.rs`: Entry point (handles Windows console suppression conditionally)
  - `lib.rs`: Tauri application initialization and configuration
- **migrations/**: SQL migration files for database schema
- **factories/**: Deterministic table factories and a seed runner for local/test data
- **capabilities/**: Permission definitions for the Tauri application
- **icons/**: Application icons in various formats for all platforms
- **tauri.conf.json**: Tauri configuration (build, app, bundling)
- **Cargo.toml**: Rust dependencies and build configuration

## Cross-Platform Building

The Tauri runtime supports building for Windows, macOS, and Linux from the configuration in `tauri.conf.json`. All dependencies are platform-independent.

### Build Targets and Output

The `tauri.conf.json` is configured to produce:

- **Windows**: MSI and NSIS installers
- **macOS**: DMG and App bundle
- **Linux**: DEB package and AppImage

### Build Configuration

The configuration in `tauri.conf.json` includes:

- **beforeBuildCommand**: Builds the Nuxt frontend before creating the desktop bundle
- **frontendDist**: Points to `.output/public` (Nuxt build output)
- **devUrl**: Local development server URL for hot reload
- **bundle.targets**: Platform-specific installer formats
- **bundle.icon**: Icons in all required formats (PNG, ICNS, ICO)

### Platform-Specific Notes

**Windows:**

- The `main.rs` file includes the `windows_subsystem = "windows"` attribute, which is conditionally applied only on Windows at release time
- MSI and NSIS installers are generated in `target/release/bundle/`

**macOS:**

- Both Intel (`x86_64-apple-darwin`) and Apple Silicon (`aarch64-apple-darwin`) builds are supported
- DMG and App bundles are generated in `target/release/bundle/`
- For production releases, code signing and notarization should be configured

**Linux:**

- DEB package and AppImage formats are supported
- Essential development libraries are required on the build system (GTK3, OpenSSL)

## Database Migrations

SQL migrations are located in the `migrations/` folder and are compiled into the binary at build time via `src/lib.rs`. The migration discovery process:

1. Scans the `migrations/` folder for `.sql` files
2. Extracts version numbers from filenames (e.g., `0001_create_projects.sql`)
3. Registers migrations in order
4. Runs them on startup via the `tauri-plugin-sql` SQLite adapter

Migrations run identically across all platforms since SQLite uses consistent SQL.

## Development

To compile and run the Tauri app in development mode:

```bash
cd .. && npm run tauri dev
```

This command:

1. Starts the Nuxt dev server at `http://127.0.0.1:3000`
2. Compiles the Rust runtime
3. Launches the desktop window with hot reload

To seed local SQLite data from deterministic factories:

```bash
cd .. && npm run db:seed
```

The seed runner reads SQL migrations from `migrations/`, clears data in FK-safe order,
then inserts mock rows in FK-safe order into `sqlite:jaa.db`.

To build for release:

```bash
cd .. && npm run tauri build
```

This creates platform-specific installers in `src-tauri/target/release/bundle/`.

## Rust Version

The project requires Rust 1.77.2 or later as specified in `Cargo.toml`. Install or update Rust using:

```bash
rustup update
```

## Dependencies

Key Tauri plugins in `Cargo.toml`:

- `tauri-plugin-sql`: SQLite database access
- `tauri-plugin-notification`: Native desktop notifications
- `tauri-plugin-log`: File-based logging
- `tauri-plugin-dialog`: Native file/message dialogs
- `tauri-plugin-fs`: File system operations
- `tauri-plugin-shell`: Shell command execution
- `tauri-plugin-store`: Persistent key-value storage
- `tauri-plugin-window-state`: Persist and restore window state
- `tauri-plugin-updater`: Application update checks
- `tauri-plugin-opener`: Open URLs and files with default applications

All dependencies are maintained by the Tauri team and support Windows, macOS, and Linux.
