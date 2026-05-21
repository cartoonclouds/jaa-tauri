import { z } from "zod";

import {
  DateTimeSchema,
  NullableStringSchema,
  NullableUrlSchema,
  NullableUuidSchema,
  UuidSchema,
} from "./fields";

export const ContactTypeSchema = z.enum(["company", "recruiter"]);

export const ContactSchema = z.object({
  id: UuidSchema,
  companyId: NullableUuidSchema,
  fullName: z.string().min(1),
  email: z.string().email().nullable(),
  phone: NullableStringSchema,
  linkedinUrl: NullableUrlSchema,
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
  type: true,
  notes: true,
}).partial({
  companyId: true,
  email: true,
  phone: true,
  linkedinUrl: true,
  notes: true,
});

export type Contact = z.infer<typeof ContactSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
