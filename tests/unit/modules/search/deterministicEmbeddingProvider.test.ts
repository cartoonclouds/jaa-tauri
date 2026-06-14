import { DeterministicEmbeddingProvider } from "@modules/search/services/DeterministicEmbeddingProvider";
import { describe, expect, it } from "vitest";

describe("deterministic embedding provider", () => {
  it("returns stable vectors with configured dimensions", async () => {
    const provider = new DeterministicEmbeddingProvider();

    const vectorOne = await provider.embed("Senior Vue engineer with Nuxt");
    const vectorTwo = await provider.embed("Senior Vue engineer with Nuxt");

    expect(vectorOne).toHaveLength(provider.dimensions);
    expect(vectorTwo).toEqual(vectorOne);
  });

  it("returns a zero vector for empty content", async () => {
    const provider = new DeterministicEmbeddingProvider();

    const vector = await provider.embed("   ");

    expect(vector.every((value) => value === 0)).toBe(true);
  });
});
