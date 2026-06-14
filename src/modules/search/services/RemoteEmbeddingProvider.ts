import type { EmbeddingProvider } from "@modules/search/types.semantic";

import { DeterministicEmbeddingProvider } from "@modules/search/services/DeterministicEmbeddingProvider";
import { temporalNowEpochMilliseconds } from "@shared/utils/temporal";

type RemoteEmbeddingMode = "ollama" | "openai-compatible";

/**
 * Configuration for remote embedding providers.
 */
export interface RemoteEmbeddingProviderOptions {
  mode: RemoteEmbeddingMode;
  model: string;
  dimensions: number;
  baseUrl: string;
  apiKey?: string;
}

/**
 * Embedding provider that targets Ollama or OpenAI-compatible HTTP APIs.
 */
export class RemoteEmbeddingProvider implements EmbeddingProvider {
  readonly model: string;

  readonly dimensions: number;

  private readonly mode: RemoteEmbeddingMode;

  private readonly baseUrl: string;

  private readonly apiKey?: string;

  private readonly fallbackProvider: DeterministicEmbeddingProvider;

  private remoteUnavailableUntil = 0;

  private readonly networkRetryCooldownMs = 30_000;

  private hasLoggedFallbackWarning = false;

  constructor(options: RemoteEmbeddingProviderOptions) {
    this.mode = options.mode;
    this.model = options.model;
    this.dimensions = options.dimensions;
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey?.trim() ?? undefined;
    this.fallbackProvider = new DeterministicEmbeddingProvider({
      model: this.model,
      dimensions: this.dimensions,
    });
  }

  async embed(text: string): Promise<number[]> {
    if (temporalNowEpochMilliseconds() < this.remoteUnavailableUntil) {
      return this.fallbackProvider.embed(text);
    }

    try {
      if (this.mode === "ollama") {
        return await this.embedWithOllama(text);
      }

      return await this.embedWithOpenAiCompatible(text);
    } catch (error) {
      if (this.isExpectedNetworkError(error)) {
        this.remoteUnavailableUntil =
          temporalNowEpochMilliseconds() + this.networkRetryCooldownMs;
      }

      if (
        !this.hasLoggedFallbackWarning &&
        !this.isExpectedNetworkError(error)
      ) {
        console.warn(
          "Remote embedding provider failed; falling back to deterministic embeddings.",
          error,
        );
        this.hasLoggedFallbackWarning = true;
      }

      return this.fallbackProvider.embed(text);
    }
  }

  private isExpectedNetworkError(error: unknown): boolean {
    if (!(error instanceof TypeError)) {
      return false;
    }

    const message = error.message.toLowerCase();
    return message.includes("failed to fetch") || message.includes("network");
  }

  private async embedWithOllama(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama embedding request failed with status ${response.status.toString()}`,
      );
    }

    const payload = (await response.json()) as { embedding?: unknown };
    return this.validateEmbedding(payload.embedding);
  }

  private async embedWithOpenAiCompatible(text: string): Promise<number[]> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        input: text,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI-compatible embedding request failed with status ${response.status.toString()}`,
      );
    }

    const payload = (await response.json()) as {
      data?: { embedding?: unknown }[];
    };

    return this.validateEmbedding(payload.data?.[0]?.embedding);
  }

  private validateEmbedding(value: unknown): number[] {
    if (!Array.isArray(value)) {
      throw new Error("Embedding response is missing a vector array.");
    }

    if (value.length !== this.dimensions) {
      throw new Error(
        `Expected ${this.dimensions.toString()} embedding dimensions but received ${value.length.toString()}.`,
      );
    }

    const vector: number[] = [];
    for (const item of value) {
      if (typeof item !== "number" || Number.isNaN(item)) {
        throw new Error("Embedding response contains a non-numeric value.");
      }

      vector.push(item);
    }

    return vector;
  }
}
