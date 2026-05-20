import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateApplicationInput } from "@modules/applications/domain/entities/Application";

import { z } from "zod";

const CreateApplicationInputSchema = z.object({
  companyId: z.string().nullable().optional(),
  title: z.string(),
  status: z.string().optional(),
  locationText: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
});

export async function createApplication(
  db: DatabaseDriver,
  input: CreateApplicationInput,
): Promise<string> {
  const parseResult = CreateApplicationInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Application title is required");
  }

  const title = parseResult.data.title.trim();
  if (!title) {
    throw new Error("Application title is required");
  }

  const id = crypto.randomUUID();
  await db.execute(
    `
    INSERT INTO applications (
      id,
      company_id,
      title,
      status,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      id,
      parseResult.data.companyId ?? null,
      title,
      parseResult.data.status ?? "saved",
    ],
  );

  return id;
}
