import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateApplicationInput } from "@modules/applications/domain/entities/Application";

export async function createApplication(
  db: DatabaseDriver,
  input: CreateApplicationInput,
): Promise<string> {
  const title = input.title.trim();

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
    [id, input.companyId ?? null, title, input.status ?? "saved"],
  );

  return id;
}
