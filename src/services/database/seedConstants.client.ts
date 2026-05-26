import type { DatabaseDriver } from "./DatabaseDriver";

import {
  CONSTANT_MODULE_SOURCES,
  createPersistedConstantRowsFromSources,
} from "@shared/constants/persistedConstants";
import { normalizeConstantValue } from "@shared/utils/constantValue";
import {
  fromDbBoolean,
  toDbBooleanInt,
} from "@shared/utils/database-mapping/persistenceValueUtils";

/**
 * Defines count row.
 */
interface CountRow {
  count: number;
}

/**
 * Defines constants row.
 */
interface ConstantRow {
  settings_label: string | null;
  type: string;
  value: string;
  label: string | null;
  is_visible: number | boolean;
}

/**
 * Normalize already persisted constants so wrapped JSON values become plain scalars.
 */
async function normalizePersistedConstantValues(
  database: DatabaseDriver,
): Promise<void> {
  const rows = await database.select<ConstantRow>(
    `SELECT settings_label, type, value, label, is_visible
     FROM constants`,
  );

  if (rows.length === 0) {
    return;
  }

  await database.transaction(async (tx) => {
    for (const row of rows) {
      const normalizedValue = normalizeConstantValue(row.value);
      if (!normalizedValue || normalizedValue === row.value) {
        continue;
      }

      await tx.execute(
        `INSERT INTO constants (settings_label, type, value, label, is_visible)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT(type, value) DO UPDATE SET
           settings_label = COALESCE(constants.settings_label, excluded.settings_label),
           label = COALESCE(constants.label, excluded.label),
           is_visible = CASE
             WHEN constants.is_visible = 1 OR excluded.is_visible = 1 THEN 1
             ELSE 0
           END`,
        [
          row.settings_label,
          row.type,
          normalizedValue,
          row.label,
          toDbBooleanInt(fromDbBoolean(row.is_visible, false)),
        ],
      );

      await tx.execute(
        `DELETE FROM constants
         WHERE type = $1 AND value = $2`,
        [row.type, row.value],
      );
    }
  });
}

/**
 * Seed persisted constants only when the constants table is empty.
 */
export async function seedConstantsOnFirstRun(
  database: DatabaseDriver,
): Promise<void> {
  const countRows = await database.select<CountRow>(
    "SELECT COUNT(*) AS count FROM constants",
  );

  const existingCount = countRows[0]?.count ?? 0;
  if (existingCount === 0) {
    const rows = createPersistedConstantRowsFromSources(
      CONSTANT_MODULE_SOURCES,
    );
    await database.transaction(async (tx) => {
      for (const row of rows) {
        await tx.execute(
          `INSERT OR IGNORE INTO constants (settings_label, type, value, label, is_visible)
           VALUES ($1, $2, $3, $4, $5)`,
          [row.settings_label, row.type, row.value, row.label, row.is_visible],
        );
      }
    });
  }

  await normalizePersistedConstantValues(database);
}
