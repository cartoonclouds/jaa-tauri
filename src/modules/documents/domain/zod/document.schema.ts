import { z } from "zod";

/** Runtime schema for persisted document entities. */
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

/** Runtime schema for creating documents from external input. */
export const CreateDocumentSchema = DocumentSchema.pick({
  title: true,
  kind: true,
  filePath: true,
  mimeType: true,
  sizeBytes: true,
  checksum: true,
}).partial({ sizeBytes: true, checksum: true });

/** Repository create payload schema for document inserts. */
export const DocumentRepositoryCreateSchema = z.object({
  title: z.string(),
  kind: z.string(),
  filePath: z.string(),
});

/**
 * Type alias for document.
 */
export type Document = z.infer<typeof DocumentSchema>;
/**
 * Type alias for create document input.
 */
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
