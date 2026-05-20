import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Company } from "@modules/companies/domain/entities/Company";

import { mapCompanyRowToEntity } from "@modules/companies/application/mappers/mapCompanyRow";

export async function listCompanies(db: DatabaseDriver): Promise<Company[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM companies ORDER BY created_at DESC",
  );

  return rows.map((row) => mapCompanyRowToEntity(row));
}
