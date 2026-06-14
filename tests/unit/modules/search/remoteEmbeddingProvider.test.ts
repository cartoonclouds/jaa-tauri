import { RemoteEmbeddingProvider } from "@modules/search/services/RemoteEmbeddingProvider";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("remote embedding provider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("requests Ollama embeddings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ embedding: [0.1, 0.2, 0.3] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new RemoteEmbeddingProvider({
      mode: "ollama",
      model: "test-model",
      dimensions: 3,
      baseUrl: "http://127.0.0.1:11434",
    });

    const embedding = await provider.embed("hello world");

    expect(embedding).toEqual([0.1, 0.2, 0.3]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/embeddings",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("requests OpenAI-compatible embeddings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: [1, 2] }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new RemoteEmbeddingProvider({
      mode: "openai-compatible",
      model: "text-embedding-3-small",
      dimensions: 2,
      baseUrl: "https://api.openai.com/v1",
      apiKey: "secret",
    });

    const embedding = await provider.embed("query");

    expect(embedding).toEqual([1, 2]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/embeddings",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const requestInit = fetchMock.mock.calls[0]?.[1] as
      | { headers?: Record<string, string> }
      | undefined;
    expect(requestInit?.headers?.Authorization).toBe("Bearer secret");
  });

  it("falls back to deterministic embedding on dimension mismatch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ embedding: [0.1, 0.2] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new RemoteEmbeddingProvider({
      mode: "ollama",
      model: "test-model",
      dimensions: 3,
      baseUrl: "http://127.0.0.1:11434",
    });

    const embedding = await provider.embed("query");

    expect(embedding).toHaveLength(3);
    expect(embedding.some((value) => value !== 0)).toBe(true);
  });

  it("falls back to deterministic embedding when remote fetch fails", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation((...args: unknown[]) => {
        void args;
      });

    const provider = new RemoteEmbeddingProvider({
      mode: "ollama",
      model: "test-model",
      dimensions: 4,
      baseUrl: "http://127.0.0.1:11434",
    });

    const embedding = await provider.embed("frontend engineer");

    expect(embedding).toHaveLength(4);
    expect(embedding.some((value) => value !== 0)).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("skips repeated remote fetch attempts during network cooldown", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    const provider = new RemoteEmbeddingProvider({
      mode: "ollama",
      model: "test-model",
      dimensions: 4,
      baseUrl: "http://127.0.0.1:11434",
    });

    await provider.embed("first query");
    await provider.embed("second query");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("logs a one-time warning for non-network remote failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ embedding: [0.1, 0.2] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation((...args: unknown[]) => {
        void args;
      });

    const provider = new RemoteEmbeddingProvider({
      mode: "ollama",
      model: "test-model",
      dimensions: 3,
      baseUrl: "http://127.0.0.1:11434",
    });

    await provider.embed("first query");
    await provider.embed("second query");

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
