const documentMimeTypeByExtension: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Derive a document MIME type from a file path.
 */
export function getDocumentMimeTypeFromFilePath(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  return documentMimeTypeByExtension[extension] ?? "application/octet-stream";
}



