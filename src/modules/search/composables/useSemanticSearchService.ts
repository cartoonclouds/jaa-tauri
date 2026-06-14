import type { SemanticSearchServiceContract } from "@modules/search/types.semantic";

import { SemanticSearchRepository } from "@modules/search/repositories/SemanticSearchRepository";
import { DeterministicEmbeddingProvider } from "@modules/search/services/DeterministicEmbeddingProvider";
import { RemoteEmbeddingProvider } from "@modules/search/services/RemoteEmbeddingProvider";
import { SemanticSearchService } from "@modules/search/services/SemanticSearchService";
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

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readRuntimeConfig(): SemanticRuntimeConfig {
  const config = useRuntimeConfig().public;
  const rawProvider = String(config.appSemanticEmbeddingProvider ?? "ollama")
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
    provider === "openai-compatible"
      ? 1536
      : provider === "ollama"
        ? 384
        : 384;

  const model = String(config.appSemanticEmbeddingModel ?? defaultModel).trim();
  const dimensions = Number(config.appSemanticEmbeddingDimensions ?? defaultDimensions);
  const baseUrl = String(
    config.appSemanticEmbeddingBaseUrl ??
      (provider === "openai-compatible"
        ? "https://api.openai.com/v1"
        : "http://127.0.0.1:11434"),
  ).trim();
  const apiKeyRaw = String(config.appSemanticEmbeddingApiKey ?? "").trim();

  return {
    provider,
    model,
    dimensions: Number.isFinite(dimensions) && dimensions > 0 ? dimensions : defaultDimensions,
    baseUrl,
    apiKey: apiKeyRaw.length > 0 ? apiKeyRaw : undefined,
    enableSqliteVec: readBoolean(config.appSemanticEnableSqliteVec, true),
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

  semanticSearchServiceInstance = new SemanticSearchService(
    repository,
    embeddingProvider,
  );

  return semanticSearchServiceInstance;
}
