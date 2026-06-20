import type { SemanticSearchServiceContract } from "@modules/search/types.semantic";

import { SemanticSearchRepository } from "@modules/search/repositories/SemanticSearchRepository";
import { DeterministicEmbeddingProvider } from "@modules/search/services/DeterministicEmbeddingProvider";
import { RemoteEmbeddingProvider } from "@modules/search/services/RemoteEmbeddingProvider";
import { toFiniteNumber } from "@shared/utils/database-mapping/numberValueUtils";
import { fromDbBoolean } from "@shared/utils/database-mapping/persistenceValueUtils";
import { toRequiredString } from "@shared/utils/database-mapping/stringValueUtils";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

import { useRuntimeConfig } from "#imports";

let semanticSearchServiceInstance: SemanticSearchServiceContract | null = null;

interface SemanticRuntimeConfig {
  provider: "deterministic" | "ollama" | "openai-compatible";
  model: string;
  dimensions: number;
  baseUrl: string;
  apiKey?: string;
  enableSqliteVec: boolean;
}

function readRuntimeConfig(): SemanticRuntimeConfig {
  const config = useRuntimeConfig().public;

  const rawProvider = !config.appSemanticEmbeddingProvider
    ? "ollama"
    : toRequiredString(config.appSemanticEmbeddingProvider)
        .trim()
        .toLowerCase();

  const provider: SemanticRuntimeConfig["provider"] =
    rawProvider === "deterministic" ||
    rawProvider === "openai-compatible" ||
    rawProvider === "ollama"
      ? rawProvider
      : "ollama";

  const defaultModel =
    provider === "openai-compatible"
      ? "text-embedding-3-small"
      : provider === "ollama"
        ? "bge-small-en"
        : "deterministic-token-v1";

  const defaultDimensions =
    provider === "openai-compatible" ? 1536 : provider === "ollama" ? 384 : 384;

  const model = (
    !config.appSemanticEmbeddingModel
      ? defaultModel
      : toRequiredString(config.appSemanticEmbeddingModel)
  ).trim();

  const dimensions = toFiniteNumber(
    config.appSemanticEmbeddingDimensions,
    defaultDimensions,
  );

  const baseUrl = (
    !config.appSemanticEmbeddingBaseUrl
      ? provider === "openai-compatible"
        ? "https://api.openai.com/v1"
        : "http://127.0.0.1:11434"
      : toRequiredString(config.appSemanticEmbeddingBaseUrl)
  ).trim();

  const apiKeyRaw = (
    !config.appSemanticEmbeddingApiKey
      ? ""
      : toRequiredString(config.appSemanticEmbeddingApiKey)
  ).trim();

  return {
    provider,
    model,
    dimensions:
      Number.isFinite(dimensions) && dimensions > 0
        ? dimensions
        : defaultDimensions,
    baseUrl,
    apiKey: apiKeyRaw.length > 0 ? apiKeyRaw : undefined,
    enableSqliteVec: fromDbBoolean(config.appSemanticEnableSqliteVec, true),
  };
}

/**
 * Returns singleton semantic search service instance.
 */
export function useSemanticSearchService(): SemanticSearchServiceContract {
  if (semanticSearchServiceInstance) {
    return semanticSearchServiceInstance;
  }

  const database = getNuxtDatabase();
  const runtimeConfig = readRuntimeConfig();
  const repository = new SemanticSearchRepository(database, {
    enableSqliteVec: runtimeConfig.enableSqliteVec,
  });

  const embeddingProvider =
    runtimeConfig.provider === "deterministic"
      ? new DeterministicEmbeddingProvider()
      : new RemoteEmbeddingProvider({
          mode:
            runtimeConfig.provider === "openai-compatible"
              ? "openai-compatible"
              : "ollama",
          model: runtimeConfig.model,
          dimensions: runtimeConfig.dimensions,
          baseUrl: runtimeConfig.baseUrl,
          apiKey: runtimeConfig.apiKey,
        });

  semanticSearchServiceInstance = {
    async upsertDocuments(documents) {
      for (const document of documents) {
        const content = document.content.trim();
        if (!content) {
          await repository.deleteByEntity({
            moduleKey: document.moduleKey,
            entityType: document.entityType,
            entityId: document.entityId,
          });
          continue;
        }

        const embedding = await embeddingProvider.embed(content);
        await repository.upsertDocumentWithEmbedding({
          document: {
            ...document,
            content,
          },
          model: embeddingProvider.model,
          dimensions: embeddingProvider.dimensions,
          embedding,
        });
      }
    },
    removeDocumentByEntity(options) {
      return repository.deleteByEntity(options);
    },
    async search(query) {
      const trimmedQuery = query.query.trim();
      if (!trimmedQuery) {
        return [];
      }

      const queryEmbedding = await embeddingProvider.embed(trimmedQuery);

      return repository.search({
        moduleKey: query.moduleKey,
        model: embeddingProvider.model,
        dimensions: embeddingProvider.dimensions,
        queryEmbedding,
        limit: query.limit ?? 10,
        entityTypes: query.entityTypes,
      });
    },
  };

  return semanticSearchServiceInstance;
}
