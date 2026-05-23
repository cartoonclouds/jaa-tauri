/**
 * Document entity stored in the application.
 */
export interface Document {
  /** Unique document identifier. */
  id: string;
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
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a document record.
 */
export interface CreateDocumentInput {
  /** Document title. */
  title: string;
  /** Document kind or classification. */
  kind: string;
  /** Absolute or relative file path. */
  filePath: string;
}



