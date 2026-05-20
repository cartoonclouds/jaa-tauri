export interface ParsedResume {
  filePath: string;
  fileName: string;
  extension: "pdf" | "docx";
  extractedText: string;
  detectedSkills: string[];
  inferredTargetRoles: string[];
}
