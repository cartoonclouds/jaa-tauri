import TurndownService from "turndown";

/**
 * Provide HTML to Markdown conversion while preserving non-standard underline formatting.
 */
export function useHtmlToMarkdown() {
  const turndownService = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    headingStyle: "atx",
    strongDelimiter: "**",
  });

  turndownService.addRule("underlineTag", {
    filter: ["u", "ins"],
    replacement(content) {
      return `<u>${content}</u>`;
    },
  });

  turndownService.addRule("underlineStyleSpan", {
    filter(node) {
      if (node.nodeName !== "SPAN") {
        return false;
      }

      const style = node.getAttribute("style")?.toLowerCase() ?? "";
      return style.includes("underline");
    },
    replacement(content) {
      return `<u>${content}</u>`;
    },
  });

  /**
   * Convert an HTML string to Markdown and normalize extra blank lines.
   */
  function htmlToMarkdown(html: string): string {
    return turndownService
      .turndown(html || "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return {
    htmlToMarkdown,
  };
}
