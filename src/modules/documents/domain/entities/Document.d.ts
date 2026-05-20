export interface Document {
  id: string;
  title: string;
  kind: string;
  filePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
  checksum: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  title: string;
  kind: string;
  filePath: string;
}
