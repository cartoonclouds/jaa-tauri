import type { EmbeddingProvider } from "@modules/search/types.semantic";

interface DeterministicEmbeddingProviderOptions {
  model?: string;
  dimensions?: number;
}

/**
 * Deterministic local embedding provider used as an offline baseline.
 */
export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly model: string;

  readonly dimensions: number;

  constructor(options: DeterministicEmbeddingProviderOptions = {}) {
    this.model = options.model ?? "deterministic-token-v1";
    const requestedDimensions = options.dimensions ?? 384;
    this.dimensions =
      Number.isFinite(requestedDimensions) && requestedDimensions > 0
        ? Math.floor(requestedDimensions)
        : 384;
  }

  embed(text: string): Promise<number[]> {
    const normalized = text.toLowerCase().trim();
    if (!normalized) {
      return Promise.resolve<number[]>(
        new Array<number>(this.dimensions).fill(0),
      );
    }

    const vector: number[] = new Array<number>(this.dimensions).fill(0);
    const tokens = normalized.split(/\s+/g).filter((token) => token.length > 0);

    for (const token of tokens) {
      const hash = this.fnv1a(token);
      const bucket = Math.abs(hash % this.dimensions);
      const sign = (hash & 1) === 0 ? 1 : -1;
      const weight = 1 + Math.min(token.length, 12) / 16;
      vector[bucket] = (vector[bucket] ?? 0) + sign * weight;
    }

    // L2 normalization keeps scores stable across document lengths.
    let sumSquares = 0;
    for (const value of vector) {
      sumSquares += value * value;
    }

    if (sumSquares <= 0) {
      return Promise.resolve(vector);
    }

    const magnitude = Math.sqrt(sumSquares);
    return Promise.resolve(vector.map((value) => value / magnitude));
  }

  private fnv1a(text: string): number {
    let hash = 0x811c9dc5;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }

    return hash | 0;
  }
}
