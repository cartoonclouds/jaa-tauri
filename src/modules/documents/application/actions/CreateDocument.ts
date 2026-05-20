import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateDocumentInput } from "@modules/documents/domain/entities/Document";

import { z } from "zod";

const CreateDocumentInputSchema = z.object({
  title: z.string(),
  kind: z.string(),
  filePath: z.string(),
});

export async function createDocument(
  db: DatabaseDriver,
  input: CreateDocumentInput,
): Promise<string> {
  const parseResult = CreateDocumentInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Document title, kind, and file path are required");
  }

  const title = parseResult.data.title.trim();
  const kind = parseResult.data.kind.trim();
  const filePath = parseResult.data.filePath.trim();
  if (!title || !kind || !filePath) {
    throw new Error("Document title, kind, and file path are required");
  }

  const id = crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO documents (
      id,
      title,
      kind,
      file_path,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, title, kind, filePath],
  );

  return id;
}
