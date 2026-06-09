import {
  getApplicationFileIcon,
  getFileExtensionFromPath,
  getFileNameFromPath,
} from "@modules/applications/presentation/utils/applicationFileUtils";
import { getDocumentMimeTypeFromFilePath } from "@modules/documents/utils/documentUtils";
import {
  getFileExtension,
  getOnboardingStepState,
  getResumeDocumentTitle,
  getResumeMimeType,
  isSupportedResumePath,
  mergeCommaSeparated,
} from "@modules/onboarding/utils/onboardingUtils";
import {
  toRate,
  toTrendPercent,
  toTrendPercentLabel,
  toTrendPointLabel,
  toTrendTone,
} from "@modules/statistics/presentation/utils/statisticMetricUtils";
import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import {
  normalizeTagName,
  resolveTagIdsWithPendingTags,
} from "@modules/tags/utils/pendingTagResolution";
import { describe, expect, it, vi } from "vitest";

describe("module utilities", () => {
  it("parses file paths and picks application file icons", () => {
    expect(getFileNameFromPath(" C:\\docs\\resume.pdf ")).toBe("resume.pdf");
    expect(getFileNameFromPath(" /tmp/ ")).toBe("Untitled file");
    expect(getFileNameFromPath("   ")).toBe("Untitled file");

    expect(getFileExtensionFromPath("resume.PDF")).toBe("pdf");
    expect(getFileExtensionFromPath("README")).toBe("");

    expect(getApplicationFileIcon("photo.png", "image/png")).toBe(
      "heroicons:photo",
    );
    expect(getApplicationFileIcon("resume.pdf", null)).toBe(
      "heroicons:document-text",
    );
    expect(getApplicationFileIcon("proposal.docx", null)).toBe(
      "heroicons:document-text",
    );
    expect(getApplicationFileIcon("data.csv", null)).toBe(
      "heroicons:table-cells",
    );
    expect(getApplicationFileIcon("slides.pptx", null)).toBe(
      "heroicons:presentation-chart-bar",
    );
    expect(getApplicationFileIcon("archive.zip", null)).toBe(
      "heroicons:archive-box",
    );
    expect(getApplicationFileIcon("notes.md", null)).toBe("heroicons:document");
    expect(getApplicationFileIcon("unknown.bin", null)).toBe(
      "heroicons:document",
    );
  });

  it("derives document mime types from file paths", () => {
    expect(getDocumentMimeTypeFromFilePath("resume.pdf")).toBe(
      "application/pdf",
    );
    expect(getDocumentMimeTypeFromFilePath("resume.docx")).toContain(
      "wordprocessingml",
    );
    expect(getDocumentMimeTypeFromFilePath("resume.txt")).toBe(
      "application/octet-stream",
    );
  });

  it("handles onboarding utility happy and fallback paths", () => {
    expect(getOnboardingStepState(0, 1)).toBe("completed");
    expect(getOnboardingStepState(1, 1)).toBe("current");
    expect(getOnboardingStepState(2, 1)).toBe("upcoming");

    expect(
      mergeCommaSeparated("Vue, TS, vue ,  ,React", ["Nuxt", "ts"]),
    ).toEqual(["Nuxt", "ts", "Vue", "React"]);
    expect(mergeCommaSeparated("   ", ["Nuxt"])).toEqual(["Nuxt"]);

    expect(getFileExtension("resume.PDF")).toBe("pdf");
    expect(getFileExtension("resume")).toBe("");
    expect(isSupportedResumePath("resume.pdf")).toBe(true);
    expect(isSupportedResumePath("resume.docx")).toBe(true);
    expect(isSupportedResumePath("resume.txt")).toBe(false);

    expect(getResumeMimeType("resume.pdf", "image/custom")).toBe(
      "image/custom",
    );
    expect(getResumeMimeType("resume.pdf", "   ")).toBe("application/pdf");
    expect(getResumeMimeType("resume.txt")).toBe("application/octet-stream");
    expect(getResumeDocumentTitle("C:\\docs\\resume.pdf")).toBe("resume.pdf");
  });

  it("normalizes pending tags and resolves ids even after create conflicts", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(new Error("duplicate"))
      .mockResolvedValueOnce("tag-3");
    const list = vi.fn().mockResolvedValue([
      { id: "tag-1", name: "existing" },
      { id: "tag-2", name: "new tag" },
      { id: "tag-3", name: "second tag" },
    ]);

    expect(normalizeTagName("  Urgent ")).toBe("urgent");

    await expect(
      resolveTagIdsWithPendingTags({
        selectedTagIds: ["tag-1", "tag-1"],
        pendingTagNames: [" New Tag ", "new tag", "Second Tag", ""],
        tagService: {
          create,
          list,
        },
        modelType: TagModelType.Application,
      }),
    ).resolves.toEqual(["tag-1", "tag-2", "tag-3"]);

    expect(create).toHaveBeenNthCalledWith(1, {
      name: "new tag",
      color: null,
      modelType: TagModelType.Application,
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      name: "second tag",
      color: null,
      modelType: TagModelType.Application,
    });
    expect(list).toHaveBeenCalledOnce();
  });

  it("formats statistic trend helpers", () => {
    expect(toTrendTone(5)).toBe("positive");
    expect(toTrendTone(-1)).toBe("negative");
    expect(toTrendTone(0)).toBe("neutral");

    expect(toTrendPercentLabel(12)).toBe("+12%");
    expect(toTrendPercentLabel(-12)).toBe("-12%");
    expect(toTrendPointLabel(3)).toBe("+3pp");
    expect(toTrendPointLabel(-3)).toBe("-3pp");

    expect(toRate(5, 10)).toBe(50);
    expect(toRate(1, 0)).toBe(0);
    expect(toTrendPercent(20, 10)).toBe(100);
    expect(toTrendPercent(5, 0)).toBe(100);
    expect(toTrendPercent(0, 0)).toBe(0);
  });

  it("resolves tag model type enum labels and fallback lookups", () => {
    expect(TagModelType.values()).toEqual([
      TagModelType.Application,
      TagModelType.Company,
      TagModelType.Contact,
      TagModelType.General,
    ]);
    expect(TagModelType.fromValue("company")).toBe(TagModelType.Company);
    expect(TagModelType.fromValue("missing")).toBeNull();
    expect(TagModelType.Application.toLabel()).toBe("Application");
    expect(TagModelType.General.toString()).toBe("general");
  });
});
