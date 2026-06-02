import {
  getFileExtension,
  getOnboardingStepState,
  getResumeDocumentTitle,
  isSupportedResumePath,
  mergeCommaSeparated,
} from "@modules/onboarding/utils/onboardingUtils";
import { describe, expect, it } from "vitest";

describe("onboardingUtils", () => {
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

  it("resolves onboarding step states from current index", () => {
    expect(getOnboardingStepState(0, 2)).toBe("completed");
    expect(getOnboardingStepState(2, 2)).toBe("current");
    expect(getOnboardingStepState(3, 2)).toBe("upcoming");
  });
});
