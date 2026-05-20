import {
  getFileExtension,
  getResumeDocumentTitle,
  isSupportedResumePath,
  mergeCommaSeparated,
} from "@modules/onboarding/application/actions/onboardingHelpers";
import { describe, expect, it } from "vitest";

describe("onboardingHelpers", () => {
  it("merges comma separated entries without duplicates", () => {
    const merged = mergeCommaSeparated("Vue, TypeScript, vue", ["Nuxt"]);

    expect(merged).toEqual(["Nuxt", "Vue", "TypeScript"]);
  });

  it("extracts file extension in lowercase", () => {
    expect(getFileExtension("C:/Docs/Resume.PDF")).toBe("pdf");
  });

  it("validates supported resume extensions", () => {
    expect(isSupportedResumePath("resume.pdf")).toBe(true);
    expect(isSupportedResumePath("resume.docx")).toBe(true);
    expect(isSupportedResumePath("resume.txt")).toBe(false);
  });

  it("builds resume document title from file path", () => {
    expect(getResumeDocumentTitle("C:/Users/me/Resume Final.docx")).toBe(
      "Resume Final.docx",
    );
  });
});
