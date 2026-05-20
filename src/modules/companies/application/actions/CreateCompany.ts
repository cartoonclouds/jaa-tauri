import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateCompanyInput } from "@modules/companies/domain/entities/Company";

import { z } from "zod";

const CreateCompanyInputSchema = z.object({
  name: z.string(),
  locationText: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
});

export async function createCompany(
  db: DatabaseDriver,
  input: CreateCompanyInput,
): Promise<string> {
  const parseResult = CreateCompanyInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Company name is required");
  }

  const name = parseResult.data.name.trim();
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
