import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateCompanyInput } from "@modules/companies/domain/entities/Company";

export async function createCompany(
  db: DatabaseDriver,
  input: CreateCompanyInput,
): Promise<string> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Company name is required");
  }

  const id = crypto.randomUUID();
  await db.execute(
    `
    INSERT INTO companies (id, name, created_at, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, name],
  );

  return id;
}
