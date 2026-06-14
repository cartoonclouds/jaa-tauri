import type { DatabaseDriver } from "./DatabaseDriver";

import { DatabaseError } from "@shared/domain/errors";

/**
 * Row shape returned by sqlite_master existence checks.
 */
interface SqliteMasterRow {
  name: string;
}

/**
 * Row shape returned by PRAGMA table_info queries.
 */
interface SqliteColumnInfoRow {
  name: string;
}

const REQUIRED_MIGRATION_TABLES = [
  "companies",
  "contacts",
  "applications",
  "tags",
  "documents",
  "events",
  "notifications",
  "settings",
  "profiles",
  "application_tags",
  "company_tags",
  "contact_tags",
  "application_documents",
  "application_contacts",
  "constants",
  "semantic_documents",
  "semantic_embeddings",
] as const;

/**
 * Ensure startup schema reflects all SQL migrations.
 *
 * This check runs on app boot so first run guarantees migration output exists
 * before any repository or seeder work begins.
 */
export async function ensureMigrationsAppliedOnFirstRun(
  database: DatabaseDriver,
): Promise<void> {
  for (const tableName of REQUIRED_MIGRATION_TABLES) {
    const rows = await database.select<SqliteMasterRow>(
      `SELECT name
       FROM sqlite_master
       WHERE type = 'table' AND name = $1
       LIMIT 1`,
      [tableName],
    );

    if (!rows[0]?.name) {
      throw new DatabaseError(
        `Database migration missing required table: ${tableName}.`,
      );
    }
  }

  const constantsColumns = await database.select<SqliteColumnInfoRow>(
    "PRAGMA table_info(constants)",
  );

  const hasLabelColumn = constantsColumns.some(
    (column) => column.name === "label",
  );
  if (!hasLabelColumn) {
    throw new DatabaseError(
      "Database migration missing required constants.label column.",
    );
  }

  const hasVisibilityColumn = constantsColumns.some(
    (column) => column.name === "is_visible",
  );
  if (!hasVisibilityColumn) {
    throw new DatabaseError(
      "Database migration missing required constants.is_visible column.",
    );
  }

  const tagsColumns = await database.select<SqliteColumnInfoRow>(
    "PRAGMA table_info(tags)",
  );

  const hasModelTypeColumn = tagsColumns.some(
    (column) => column.name === "model_type",
  );

  if (!hasModelTypeColumn) {
    await database.execute(
      "ALTER TABLE tags ADD COLUMN model_type TEXT NOT NULL DEFAULT 'general'",
    );
  }

  const settingsColumns = await database.select<SqliteColumnInfoRow>(
    "PRAGMA table_info(settings)",
  );

  const settingsColumnNames = new Set(
    settingsColumns.map((column) => column.name),
  );

  if (!settingsColumnNames.has("semantic_embedding_provider")) {
    await database.execute(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_provider TEXT NOT NULL DEFAULT 'ollama'",
    );
  }

  if (!settingsColumnNames.has("semantic_embedding_model")) {
    await database.execute(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_model TEXT NOT NULL DEFAULT 'bge-small-en'",
    );
  }

  if (!settingsColumnNames.has("semantic_embedding_dimensions")) {
    await database.execute(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_dimensions INTEGER NOT NULL DEFAULT 384",
    );
  }

  if (!settingsColumnNames.has("semantic_embedding_base_url")) {
    await database.execute(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_base_url TEXT NOT NULL DEFAULT 'http://127.0.0.1:11434'",
    );
  }

  if (!settingsColumnNames.has("semantic_embedding_api_key")) {
    await database.execute(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_api_key TEXT",
    );
  }

  if (!settingsColumnNames.has("semantic_enable_sqlite_vec")) {
    await database.execute(
      "ALTER TABLE settings ADD COLUMN semantic_enable_sqlite_vec INTEGER NOT NULL DEFAULT 1",
    );
  }
}
