import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Contact } from "@modules/contacts/domain/entities/Contact";

import { mapContactRowToEntity } from "@modules/contacts/application/mappers/mapContactRow";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export async function listContacts(db: DatabaseDriver): Promise<Contact[]> {
  const rows = await db.select<Record<string, unknown>>(
    buildSelectAllOrderedQuery({
      tableName: "contacts",
      orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
    }),
  );

  return rows.map((row) => mapContactRowToEntity(row));
}
