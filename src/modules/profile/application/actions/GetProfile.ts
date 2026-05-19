import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Profile } from "@modules/profile/domain/entities/Profile";

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

  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    linkedinUrl: (row.linkedin_url as string | null) ?? null,
    portfolioUrl: (row.portfolio_url as string | null) ?? null,
    headline: (row.headline as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    locationText: (row.location_text as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
