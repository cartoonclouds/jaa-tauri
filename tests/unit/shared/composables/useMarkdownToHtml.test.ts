import { describe, expect, it } from "vitest";

import { useMarkdownToHtml } from "@/composables/useMarkdownToHtml";

describe("useMarkdownToHtml", () => {
  it("converts common markdown formatting into html", () => {
    const { markdownToHtml } = useMarkdownToHtml();

    const html = markdownToHtml("# Title\n\n**Bold** and *italic*");

    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("returns empty output for empty markdown", () => {
    const { markdownToHtml } = useMarkdownToHtml();

    const html = markdownToHtml("").trim();

    expect(html).toBe("");
  });
});
