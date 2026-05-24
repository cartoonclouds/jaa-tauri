import {
  DateTimeSchema,
  NullableLatitudeSchema,
  NullableLongitudeSchema,
  NullableStringSchema,
  NullableUrlSchema,
  NullableUuidSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

/** Allowed contact categories persisted by the domain model. */
export const ContactTypeSchema = z.enum(["company", "recruiter"]);

/** Runtime schema for persisted contact entities. */
export const ContactSchema = z.object({
  id: UuidSchema,
  companyId: NullableUuidSchema,
  fullName: z.string().min(1),
  email: z.string().email().nullable(),
  phone: NullableStringSchema,
  linkedinUrl: NullableUrlSchema,
  locationText: NullableStringSchema,
  locationLat: NullableLatitudeSchema,
  locationLng: NullableLongitudeSchema,
  type: ContactTypeSchema,
  notes: NullableStringSchema,
  tagIds: z.array(UuidSchema),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

/** Runtime schema for creating contacts from external input. */
export const CreateContactSchema = ContactSchema.pick({
  companyId: true,
  fullName: true,
  email: true,
  phone: true,
  linkedinUrl: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
  type: true,
  notes: true,
}).partial({
  companyId: true,
  email: true,
  phone: true,
  linkedinUrl: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
  notes: true,
});

/** Repository create payload schema for contact inserts. */
export const ContactRepositoryCreateSchema = CreateContactSchema;

/**
 * Type alias for contact.
 */
export type Contact = z.infer<typeof ContactSchema>;
/**
 * Type alias for create contact input.
 */
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
