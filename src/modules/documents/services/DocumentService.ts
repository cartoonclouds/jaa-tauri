import {
  type DocumentCreatePayload,
  type DocumentUpdatePayload,
  type IDocumentRepository,
} from "@modules/documents/repositories/DocumentRepository";

export class DocumentService {
  constructor(private readonly repository: IDocumentRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: DocumentCreatePayload) {
    if (!payload.title.trim()) {
      throw new Error("Document title is required");
    }
    if (!payload.filePath.trim()) {
      throw new Error("Document file path is required");
    }

    return this.repository.create({
      ...payload,
      title: payload.title.trim(),
      filePath: payload.filePath.trim(),
    });
  }

  update(payload: DocumentUpdatePayload) {
    return this.repository.update({
      ...payload,
      title: payload.title?.trim(),
      filePath: payload.filePath?.trim(),
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
