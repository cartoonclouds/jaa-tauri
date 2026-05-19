import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Profile } from "@modules/profile/domain/entities/Profile";

export type ProfileCreatePayload = Pick<
  Profile,
  | "fullName"
  | "email"
  | "phone"
  | "linkedinUrl"
  | "portfolioUrl"
  | "headline"
  | "summary"
  | "locationText"
>;
export type ProfileUpdatePayload = Partial<ProfileCreatePayload> & {
  id: string;
};

export class ProfileRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Profile[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM profiles ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
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
    }));
  }

  async create(payload: ProfileCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO profiles (id, full_name, email, phone, linkedin_url, portfolio_url, headline, summary, location_text, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        payload.fullName,
        payload.email ?? null,
        payload.phone ?? null,
        payload.linkedinUrl ?? null,
        payload.portfolioUrl ?? null,
        payload.headline ?? null,
        payload.summary ?? null,
        payload.locationText ?? null,
      ],
    );
    return id;
  }

  async update(payload: ProfileUpdatePayload): Promise<void> {
    await this.db.execute(
      `UPDATE profiles
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           linkedin_url = COALESCE($4, linkedin_url),
           portfolio_url = COALESCE($5, portfolio_url),
           headline = COALESCE($6, headline),
           summary = COALESCE($7, summary),
           location_text = COALESCE($8, location_text),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        payload.fullName ?? null,
        payload.email ?? null,
        payload.phone ?? null,
        payload.linkedinUrl ?? null,
        payload.portfolioUrl ?? null,
        payload.headline ?? null,
        payload.summary ?? null,
        payload.locationText ?? null,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM profiles WHERE id = $1", [id]);
  }
}
