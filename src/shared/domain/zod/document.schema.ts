import { z } from "zod";

export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  applicationId: z.string().uuid().nullable(),
  kind: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
