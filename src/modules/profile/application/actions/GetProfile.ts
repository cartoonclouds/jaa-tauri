import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Profile } from "@modules/profile/domain/entities/Profile";

import { mapProfileRowToEntity } from "@modules/profile/application/mappers/mapProfileRow";

export async function getProfile(
  db: DatabaseDriver,
  id: string,
): Promise<Profile | null> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM profiles WHERE id = $1 LIMIT 1",
    [id],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return mapProfileRowToEntity(row, "Profile read validation failed");
}
