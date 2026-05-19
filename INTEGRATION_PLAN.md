# Integration Plan: Tauri SQL Migrations + Typed Nuxt Database Layer

This package removes Pinia ORM and uses a smaller stack:

- Tauri SQL plugin migrations for schema ownership.
- `DatabaseDriver` interface for portable database access.
- `TauriSqliteDriver` as the production desktop implementation.
- Repository classes for typed SQL access.
- Service classes for business rules.
- Pinia Colada for query/mutation state and cache invalidation.
- Pinia for local UI state only.

## 1. Install dependencies

From the project root:

```bash
npm run tauri add sql
npm install @tauri-apps/plugin-sql
npx nuxi module add pinia
npx nuxi module add @pinia/colada-nuxt
```

From `src-tauri`:

```bash
cargo add tauri-plugin-sql --features sqlite
```

## 2. Copy files into the project

Copy the contents of this package into the matching project paths.

Important files:

```txt
src-tauri/migrations/*.sql
src-tauri/src/lib.rs
app/services/database/*
app/types/nuxt.d.ts
app/domain/applications/**
.github/prompts/make-tauri-sqlite-migration.prompt.md
```

If your Nuxt source directory is not `app/`, move these files into your configured Nuxt source directory and update imports accordingly.

## 3. Merge `src-tauri/src/lib.rs`

If you already have a `lib.rs`, do not overwrite it blindly.

Merge this section into your existing `tauri::Builder`:

```rust
.plugin(
    tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:jaa.db", migrations)
        .build(),
)
```

Also copy the `migrations` vector and `use tauri_plugin_sql::{Migration, MigrationKind};` import.

## 4. Merge Nuxt config

Do not overwrite your existing `nuxt.config.ts`. Use `nuxt.config.patch.ts` as a reference and merge these parts:

```ts
modules: ["@pinia/nuxt", "@pinia/colada-nuxt"];
```

For Tauri desktop usage, prefer:

```ts
ssr: false;
```

Add auto-import directories if useful:

```ts
imports: {
  dirs: [
    'domain/**/queries',
    'domain/**/stores',
    'services/**',
  ],
}
```

## 5. Validate database startup

Run:

```bash
npm run tauri dev
```

Expected result:

- Tauri starts.
- The SQL plugin loads.
- `sqlite:jaa.db` is created if missing.
- Registered migrations run once.
- `PRAGMA foreign_keys = ON` is applied when the Nuxt database plugin connects.

## 6. Add a test page or call the query hooks

Use the generated hooks:

```ts
const { data: applications } = useApplicationsQuery();
const createApplication = useCreateApplicationtMutation();
```

Call:

```ts
await createProject.mutateAsync({ name: "My first application" });
```

The `applications` query should invalidate and refresh after creation.

## 7. Add new migrations with Copilot

Place the prompt file at:

```txt
.github/prompts/make-tauri-sqlite-migration.prompt.md
```

Then ask Copilot Chat:

```txt
Use .github/prompts/make-tauri-sqlite-migration.prompt.md and generate a migration called create_notes_table.
```

Copilot should:

- Create the next numbered SQL file.
- Add a matching `Migration` entry in `src-tauri/src/lib.rs`.
- Keep migration order stable.

## 8. Recommended next improvements

1. Add repository tests using a fake driver or test SQLite driver.
2. Add a richer `SqliteTestDriver` for integration tests.
3. Add table-specific repositories for each domain module.
4. Keep SQL migrations immutable after release.
5. Add a migration review checklist to pull requests.

## 9. Boundary rule

Domain repositories should depend on:

```ts
DatabaseDriver;
```

They should not import:

```ts
@tauri-apps/plugin-sql
```

This keeps the storage backend replaceable later.
