import type { DatabaseDriver } from "./DatabaseDriver";

import {
  CONSTANT_MODULE_SOURCES,
  createPersistedConstantRowsFromSources,
} from "@shared/constants/persistedConstants";

interface CountRow {
  count: number;
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
  if (existingCount > 0) {
    return;
  }

  const rows = createPersistedConstantRowsFromSources(CONSTANT_MODULE_SOURCES);
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
