import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  ContactType,
  CreateContactInput,
} from "@modules/contacts/domain/entities/Contact";

import { z } from "zod";

const CONTACT_TYPES: ContactType[] = ["company", "recruiter"];

const CreateContactInputSchema = z.object({
  companyId: z.string().nullable().optional(),
  fullName: z.string(),
  locationText: z.string().nullable().optional(),
  locationLat: z.number().min(-90).max(90).nullable().optional(),
  locationLng: z.number().min(-180).max(180).nullable().optional(),
  type: z.string(),
});

export async function createContact(
  db: DatabaseDriver,
  input: CreateContactInput,
): Promise<string> {
  const parseResult = CreateContactInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Contact full name is required");
  }

  const fullName = parseResult.data.fullName.trim();
  if (!fullName) {
    throw new Error("Contact full name is required");
  }

  if (!CONTACT_TYPES.includes(parseResult.data.type as ContactType)) {
    throw new Error("Invalid contact type");
  }

  const id = crypto.randomUUID();
  await db.execute(
    `
    INSERT INTO contacts (
      id,
      company_id,
      full_name,
      location_text,
      location_lat,
      location_lng,
      type,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      id,
      input.companyId ?? null,
      fullName,
      parseResult.data.locationText ?? null,
      parseResult.data.locationLat ?? null,
      parseResult.data.locationLng ?? null,
      parseResult.data.type,
    ],
  );

  return id;
}
