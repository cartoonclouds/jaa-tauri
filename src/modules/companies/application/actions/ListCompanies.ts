import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Company } from "@modules/companies/domain/entities/Company";

import { mapCompanyRowToEntity } from "@modules/companies/application/mappers/mapCompanyRow";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export async function listCompanies(db: DatabaseDriver): Promise<Company[]> {
  const rows = await db.select<Record<string, unknown>>(
    buildSelectAllOrderedQuery({
      tableName: "companies",
      orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
    }),
  );

  return rows.map((row) => mapCompanyRowToEntity(row));
}
