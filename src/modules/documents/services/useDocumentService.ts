import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { DocumentRepository } from "@modules/documents/repositories/DocumentRepository";
import { DocumentService } from "@modules/documents/services/DocumentService";
import { useNuxtApp } from "nuxt/app";

export function useDocumentService(): DocumentService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new DocumentService(new DocumentRepository(database));
}
