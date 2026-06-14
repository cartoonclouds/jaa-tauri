/**
 * Document payload indexed for module-level semantic search.
 */
export interface SemanticDocumentInput {
  moduleKey: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Match row returned by semantic search.
 */
export interface SemanticSearchMatch {
  documentId: string;
  moduleKey: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
  distance: number;
}

/**
 * Search options for semantic query execution.
 */
export interface SemanticSearchQuery {
  moduleKey: string;
  query: string;
  limit?: number;
  entityTypes?: string[];
}

/**
 * Embedding provider contract used by semantic search services.
 */
export interface EmbeddingProvider {
  model: string;
  dimensions: number;
  embed(text: string): Promise<number[]>;
}

/**
 * Contract for module-agnostic semantic indexing and query execution.
 */
export interface SemanticSearchServiceContract {
  upsertDocuments(documents: SemanticDocumentInput[]): Promise<void>;
  removeDocumentByEntity(options: {
    moduleKey: string;
    entityType: string;
    entityId: string;
  }): Promise<void>;
  search(query: SemanticSearchQuery): Promise<SemanticSearchMatch[]>;
}
