import { z } from "zod";

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  color: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateTagSchema = TagSchema.pick({
  name: true,
  color: true,
}).partial({ color: true });

export type Tag = z.infer<typeof TagSchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
