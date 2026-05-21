import { z } from "zod";

export const ContactTypeSchema = z.enum(["company", "recruiter"]);

export const ContactSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid().nullable(),
  fullName: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  linkedinUrl: z.string().url().nullable(),
  type: ContactTypeSchema,
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
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
