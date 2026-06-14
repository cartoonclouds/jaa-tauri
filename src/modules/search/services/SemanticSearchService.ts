import type {
  EmbeddingProvider,
  SemanticDocumentInput,
  SemanticSearchMatch,
  SemanticSearchQuery,
  SemanticSearchServiceContract,
} from "@modules/search/types.semantic";

import { type SemanticSearchRepository } from "@modules/search/repositories/SemanticSearchRepository";

/**
 * Coordinates semantic indexing and query operations.
 */
export class SemanticSearchService implements SemanticSearchServiceContract {
  constructor(
    private readonly repository: SemanticSearchRepository,
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async upsertDocuments(documents: SemanticDocumentInput[]): Promise<void> {
    for (const document of documents) {
      const content = document.content.trim();
      if (!content) {
        await this.removeDocumentByEntity({
          moduleKey: document.moduleKey,
          entityType: document.entityType,
          entityId: document.entityId,
        });
        continue;
      }

      const embedding = await this.embeddingProvider.embed(content);
      await this.repository.upsertDocumentWithEmbedding({
        document: {
          ...document,
          content,
        },
        model: this.embeddingProvider.model,
        dimensions: this.embeddingProvider.dimensions,
        embedding,
      });
    }
  }

  removeDocumentByEntity(options: {
    moduleKey: string;
    entityType: string;
    entityId: string;
  }): Promise<void> {
    return this.repository.deleteByEntity(options);
  }

  async search(query: SemanticSearchQuery): Promise<SemanticSearchMatch[]> {
    const trimmedQuery = query.query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const queryEmbedding = await this.embeddingProvider.embed(trimmedQuery);

    return this.repository.search({
      moduleKey: query.moduleKey,
      model: this.embeddingProvider.model,
      dimensions: this.embeddingProvider.dimensions,
      queryEmbedding,
      limit: query.limit ?? 10,
      entityTypes: query.entityTypes,
    });
  }
}
