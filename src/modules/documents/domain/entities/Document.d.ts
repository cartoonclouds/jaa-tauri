/**
/**
 * All mutable data fields shared across document read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface DocumentBase {
  /** Document title. */
  title: string;
  /** Document kind or classification. */
  kind: string;
  /** Absolute or relative file path. */
  filePath: string;
  /** MIME type, when known. */
  mimeType: string | null;
  /** File size in bytes, when known. */
  sizeBytes: number | null;
  /** File checksum, when known. */
  checksum: string | null;
}

/**
 * Document entity stored in the application.
 * Extends {@link DocumentBase} with system-managed fields.
 */
export interface Document extends DocumentBase {
  /** Unique document identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a document record.
 * Derived from {@link DocumentBase}: `title`, `kind`, and `filePath` are
 * required; all other base fields are optional.
 */
export type CreateDocumentInput = Pick<
  DocumentBase,
  "title" | "kind" | "filePath"
> &
  Partial<Omit<DocumentBase, "title" | "kind" | "filePath">>;
