import { marked } from "marked";

/**
 * Provide Markdown to HTML conversion for rich text editors and previews.
 */
export function useMarkdownToHtml() {
  /**
   * Convert a markdown string to HTML.
   */
  function markdownToHtml(markdown: string): string {
    return marked.parse(markdown || "", { async: false });
  }

  return {
    markdownToHtml,
  };
}
