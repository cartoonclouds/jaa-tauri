/**
 * Returns the trailing file name segment from a path.
 */
export function getFileNameFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/").trim();
  const fileName = normalized.split("/").pop()?.trim();

  return fileName && fileName.length > 0 ? fileName : "Untitled file";
}

/**
 * Extracts the lowercase file extension from a path.
 */
export function getFileExtensionFromPath(filePath: string): string {
  const fileName = getFileNameFromPath(filePath);
  const extension = fileName.split(".").pop()?.toLowerCase().trim() ?? "";

  if (!extension || extension === fileName.toLowerCase()) {
    return "";
  }

  return extension;
}

/**
 * Resolves a Heroicons glyph for a file based on extension and mime type.
 */
export function getApplicationFileIcon(
  filePath: string,
  mimeType: string | null,
): string {
  const extension = getFileExtensionFromPath(filePath);

  if (mimeType?.startsWith("image/")) {
    return "heroicons:photo";
  }

  if (mimeType === "application/pdf" || extension === "pdf") {
    return "heroicons:document-text";
  }

  if (["doc", "docx", "odt", "rtf"].includes(extension)) {
    return "heroicons:document-text";
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return "heroicons:table-cells";
  }

  if (["ppt", "pptx"].includes(extension)) {
    return "heroicons:presentation-chart-bar";
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "heroicons:archive-box";
  }

  if (["txt", "md"].includes(extension)) {
    return "heroicons:document";
  }

  return "heroicons:document";
}
