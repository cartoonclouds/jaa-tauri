import { describe, expect, it } from "vitest";

import { useHtmlToMarkdown } from "@/composables/useHtmlToMarkdown";

describe("useHtmlToMarkdown", () => {
  it("converts common html formatting into markdown", () => {
    const { htmlToMarkdown } = useHtmlToMarkdown();

    const markdown = htmlToMarkdown(
      '<h2>Title</h2><p><strong>Bold</strong> and <em>italic</em> with <a href="https://example.com">link</a></p>',
    );

    expect(markdown).toContain("## Title");
    expect(markdown).toContain("**Bold**");
    expect(markdown).toContain("*italic*");
    expect(markdown).toContain("[link](https://example.com)");
  });

  it("preserves underline tags as inline html", () => {
    const { htmlToMarkdown } = useHtmlToMarkdown();

    const markdown = htmlToMarkdown("<p><u>Underlined</u> text</p>");

    expect(markdown).toContain("<u>Underlined</u>");
  });

  it("preserves underline style spans as inline html", () => {
    const { htmlToMarkdown } = useHtmlToMarkdown();

    const markdown = htmlToMarkdown(
      '<p><span style="text-decoration: underline;">Styled Underline</span></p>',
    );

    expect(markdown).toContain("<u>Styled Underline</u>");
  });
});
