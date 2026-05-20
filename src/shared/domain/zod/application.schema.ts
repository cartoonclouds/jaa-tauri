import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  position: z.string().min(1),
  status: z.string().min(1),
  appliedAt: z.string().datetime().nullable(),
  source: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
