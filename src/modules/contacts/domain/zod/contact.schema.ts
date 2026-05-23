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

export const ContactTypeSchema = z.enum(["company", "recruiter"]);

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
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

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

export type Contact = z.infer<typeof ContactSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
