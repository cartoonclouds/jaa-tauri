# Make Tauri SQLite Migration

You are working in a Nuxt + Tauri v2 desktop app using `@tauri-apps/plugin-sql` and Rust-side migrations.

Generate a new SQLite migration similar to Laravel's `php artisan make:migration`.

## Inputs

Migration name:

```txt
${input:migrationName:Example: create_projects_table}
```

## Requirements

1. Create a new SQL migration file in:

```txt
src-tauri/migrations/
```

2. File naming format:

```txt
NNNN_snake_case_migration_name.sql
```

Where `NNNN` is the next available numeric version after the highest existing migration.

Examples:

```txt
0001_create_projects_table.sql
0002_create_tasks_table.sql
0003_add_status_to_tasks_table.sql
```

3. Use SQLite syntax only.

4. Always use safe idempotent SQL where appropriate:

```sql
CREATE TABLE IF NOT EXISTS ...
CREATE INDEX IF NOT EXISTS ...
ALTER TABLE ...
```

5. If the migration name starts with `create_` and ends with `_table`, generate:

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

6. If the migration name starts with `add_`, generate an `ALTER TABLE` skeleton.

7. If the migration name starts with `drop_`, generate a commented destructive migration and require a clear warning comment.

8. Also update:

```txt
src-tauri/src/lib.rs
```

Add a new `Migration` entry to the existing migrations vector:

```rust
Migration {
    version: VERSION_NUMBER,
    description: "snake_case_migration_name",
    sql: include_str!("../migrations/FILENAME.sql"),
    kind: MigrationKind::Up,
},
```

9. Keep migrations ordered by version.

10. Do not remove or rewrite existing migrations.

11. Do not create a down migration unless this project already has a clear down-migration convention.

12. Create one migration per file. Do not combine multiple changes into a single migration.

13. After generating the migration, show:
    - created file path
    - migration version
    - table name inferred, if any
    - any manual edits still needed

## Project conventions

- SQLite database URL is `sqlite:jaa.db`.
- IDs should default to `TEXT PRIMARY KEY NOT NULL` because app-generated UUIDs are preferred.
- Timestamps should be ISO-compatible text.
- Foreign keys should use:

```sql
FOREIGN KEY (column_id)
  REFERENCES other_table(id)
  ON DELETE CASCADE
```

- Index foreign keys.
- Prefer explicit indexes for lookup columns.
- Keep SQL readable and formatted.
