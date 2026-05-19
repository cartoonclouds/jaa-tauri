import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateProfileInput } from "@modules/profile/domain/entities/Profile";

export async function createProfile(
  db: DatabaseDriver,
  input: CreateProfileInput,
): Promise<string> {
  const fullName = input.fullName.trim();

  if (!fullName) {
    throw new Error("Profile full name is required");
  }

  const id = crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO profiles (
      id,
      full_name,
      email,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, fullName, input.email ?? null],
  );

  return id;
}
