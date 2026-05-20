const resumeExtensionPattern = /\.([a-z0-9]+)$/i;

export function mergeCommaSeparated(
  input: string,
  current: string[],
): string[] {
  if (!input.trim()) {
    return current;
  }

  const existing = new Set(current.map((item) => item.toLowerCase()));
  const merged = [...current];

  for (const rawValue of input.split(",")) {
    const value = rawValue.trim();
    if (!value) {
      continue;
    }

    const key = value.toLowerCase();
    if (!existing.has(key)) {
      existing.add(key);
      merged.push(value);
    }
  }

  return merged;
}

export function getFileExtension(filePath: string): string {
  const match = resumeExtensionPattern.exec(filePath);
  return match?.[1]?.toLowerCase() ?? "";
}

export function isSupportedResumePath(filePath: string): boolean {
  const extension = getFileExtension(filePath);
  return extension === "pdf" || extension === "docx";
}

export function getResumeDocumentTitle(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] ?? "Resume";
}
