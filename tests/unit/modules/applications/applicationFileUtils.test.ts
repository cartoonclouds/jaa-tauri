import {
  getApplicationFileIcon,
  getFileExtensionFromPath,
  getFileNameFromPath,
} from "@modules/applications/presentation/utils/applicationFileUtils";
import { describe, expect, it } from "vitest";

describe("applicationFileUtils", () => {
  it("returns a filename from windows and unix paths", () => {
    expect(getFileNameFromPath("C:/Users/me/Documents/offer.pdf")).toBe(
      "offer.pdf",
    );
    expect(getFileNameFromPath("C:\\Users\\me\\Documents\\cv.docx")).toBe(
      "cv.docx",
    );
  });

  it("extracts lowercase file extensions", () => {
    expect(getFileExtensionFromPath("resume.PDF")).toBe("pdf");
    expect(getFileExtensionFromPath("README")).toBe("");
  });

  it("maps extension and mime type to expected icons", () => {
    expect(getApplicationFileIcon("cover-letter.docx", null)).toBe(
      "heroicons:document-text",
    );
    expect(getApplicationFileIcon("portfolio.zip", null)).toBe(
      "heroicons:archive-box",
    );
    expect(getApplicationFileIcon("screenshot.bin", "image/png")).toBe(
      "heroicons:photo",
    );
  });
});
