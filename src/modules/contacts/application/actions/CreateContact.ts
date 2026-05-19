import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  ContactType,
  CreateContactInput,
} from "@modules/contacts/domain/entities/Contact";

const CONTACT_TYPES: ContactType[] = ["business", "recruiter"];

export async function createContact(
  db: DatabaseDriver,
  input: CreateContactInput,
): Promise<string> {
  const fullName = input.fullName.trim();

  if (!fullName) {
    throw new Error("Contact full name is required");
  }

  if (!CONTACT_TYPES.includes(input.type)) {
    throw new Error("Invalid contact type");
  }

  const id = crypto.randomUUID();
  await db.execute(
    `
    INSERT INTO contacts (
      id,
      company_id,
      full_name,
      type,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, input.companyId ?? null, fullName, input.type],
  );

  return id;
}
