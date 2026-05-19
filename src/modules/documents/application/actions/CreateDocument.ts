import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateDocumentInput } from "@modules/documents/domain/entities/Document";

export async function createDocument(
  db: DatabaseDriver,
  input: CreateDocumentInput,
): Promise<string> {
  const title = input.title.trim();
  const kind = input.kind.trim();
  const filePath = input.filePath.trim();

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
