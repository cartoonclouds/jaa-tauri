import { normalizeConstantValue } from "@shared/utils/constantValue";
import Database from "better-sqlite3";
import { loadEnv } from "vite";

import {
  resolveDatabaseUrlFromEnv,
  resolveSqliteFile,
  type SqliteDatabaseLike,
} from "./db-utils";
import { FactoryDatabaseError } from "./errors";

interface ConstantRow {
  settings_label: string | null;
  type: string;
  value: string;
  label: string | null;
  is_visible: number;
}

interface NormalizationSummary {
  scanned: number;
  normalized: number;
}

const DatabaseCtor = Database;

function ensureConstantsTableExists(db: SqliteDatabaseLike): void {
  const row = db
    .prepare(
      `SELECT name
       FROM sqlite_master
       WHERE type = 'table' AND name = 'constants'
       LIMIT 1`,
    )
    .get() as { name?: string } | undefined;

  if (!row?.name) {
    throw new FactoryDatabaseError(
      "constants table not found. Run migrations first.",
    );
  }
}

function normalizeConstants(db: SqliteDatabaseLike): NormalizationSummary {
  const rows = db
    .prepare(
      `SELECT settings_label, type, value, label, is_visible
     FROM constants`,
    )
    .all() as ConstantRow[];

  const upsertStatement = db.prepare(
    `INSERT INTO constants (settings_label, type, value, label, is_visible)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(type, value) DO UPDATE SET
       settings_label = COALESCE(constants.settings_label, excluded.settings_label),
       label = COALESCE(constants.label, excluded.label),
       is_visible = CASE
         WHEN constants.is_visible = 1 OR excluded.is_visible = 1 THEN 1
         ELSE 0
       END`,
  );

  const deleteStatement = db.prepare(
    `DELETE FROM constants
     WHERE type = ? AND value = ?`,
  );

  let normalized = 0;

  const execute = db.transaction(() => {
    for (const row of rows) {
      const normalizedValue = normalizeConstantValue(row.value);
      if (!normalizedValue || normalizedValue === row.value) {
        continue;
      }

      upsertStatement.run(
        row.settings_label,
        row.type,
        normalizedValue,
        row.label,
        row.is_visible,
      );
      deleteStatement.run(row.type, row.value);
      normalized += 1;
    }
  });

  execute();

  return {
    scanned: rows.length,
    normalized,
  };
}

function main(): void {
  const env = loadEnv("", process.cwd(), "");
  const databaseUrl =
    env.DATABASE_URL && env.DATABASE_URL.trim().length > 0
      ? env.DATABASE_URL
      : resolveDatabaseUrlFromEnv(env);

  const databaseFile = resolveSqliteFile(databaseUrl);
  const db = new DatabaseCtor(databaseFile);

  try {
    ensureConstantsTableExists(db);
    const summary = normalizeConstants(db);

    process.stdout.write("Constants normalization complete\n");
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    process.stdout.write(`Database: ${databaseFile}\n`);
  } finally {
    db.close();
  }
}

main();
