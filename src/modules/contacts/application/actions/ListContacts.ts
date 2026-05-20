import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Contact } from "@modules/contacts/domain/entities/Contact";

import { mapContactRowToEntity } from "@modules/contacts/application/mappers/mapContactRow";

export async function listContacts(db: DatabaseDriver): Promise<Contact[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM contacts ORDER BY created_at DESC",
  );

  return rows.map((row) => mapContactRowToEntity(row));
}
