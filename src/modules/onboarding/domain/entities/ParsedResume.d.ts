/**
 * Parsed resume data extracted during onboarding.
 */
export interface ParsedResume {
  /** Original file path for the resume. */
  filePath: string;
  /** File name derived from the resume path. */
  fileName: string;
  /** Supported file extension. */
  extension: "pdf" | "docx";
  /** Extracted plain-text content. */
  extractedText: string;
  /** Skills inferred from the extracted text. */
  detectedSkills: string[];
  /** Target roles inferred from the extracted text. */
  inferredTargetRoles: string[];
}
