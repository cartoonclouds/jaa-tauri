/**
 * Runtime configuration values injected into the Nuxt app.
 */
export interface DatabasePublicRuntimeConfig {
  /** Optional database driver override. */
  appDatabaseDriver?: string;
  /** Optional database name override. */
  appDatabaseName?: string;
  /** Optional database URL override. */
  appDatabaseUrl?: string;
  /** Semantic embedding provider key (deterministic, ollama, openai-compatible). */
  appSemanticEmbeddingProvider?: string;
  /** Semantic embedding model identifier. */
  appSemanticEmbeddingModel?: string;
  /** Semantic embedding dimensions. */
  appSemanticEmbeddingDimensions?: number | string;
  /** Semantic embedding service base URL. */
  appSemanticEmbeddingBaseUrl?: string;
  /** Optional API key for remote embedding providers. */
  appSemanticEmbeddingApiKey?: string;
  /** Enables sqlite-vec acceleration when available. */
  appSemanticEnableSqliteVec?: boolean | string;
}
