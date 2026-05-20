import { z } from "zod";

export const ContactSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  companyId: z.string().uuid().nullable(),
  role: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;
