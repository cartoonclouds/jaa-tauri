import type { DatabaseDriver } from "./DatabaseDriver";

/**
 * Defines sqlite master row.
 */
interface SqliteMasterRow {
  name: string;
}

/**
 * Defines sqlite column info row.
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
  "application_documents",
  "application_contacts",
  "constants",
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
      throw new Error(
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
    throw new Error(
      "Database migration missing required constants.label column.",
    );
  }

  const hasVisibilityColumn = constantsColumns.some(
    (column) => column.name === "is_visible",
  );
  if (!hasVisibilityColumn) {
    throw new Error(
      "Database migration missing required constants.is_visible column.",
    );
  }
}








