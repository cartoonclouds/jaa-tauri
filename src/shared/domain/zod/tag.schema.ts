import { z } from "zod";

export const TagSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  color: z.string().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Tag = z.infer<typeof TagSchema>;
