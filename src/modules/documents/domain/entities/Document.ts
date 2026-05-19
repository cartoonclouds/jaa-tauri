export interface Document {
  id: string;
  title: string;
  kind: string;
  filePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
  checksum: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  title: string;
  kind: string;
  filePath: string;
}
