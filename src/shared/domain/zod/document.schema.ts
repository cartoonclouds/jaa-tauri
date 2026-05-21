import { z } from "zod";

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  kind: z.string().min(1),
  filePath: z.string().min(1),
  mimeType: z.string(),
  sizeBytes: z.number().nullable(),
  checksum: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateDocumentSchema = DocumentSchema.pick({
  title: true,
  kind: true,
  filePath: true,
  mimeType: true,
  sizeBytes: true,
  checksum: true,
}).partial({ sizeBytes: true, checksum: true });

export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
