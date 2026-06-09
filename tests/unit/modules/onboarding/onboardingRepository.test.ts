import { ValidationError } from "@shared/domain/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildUserProfile } from "../../../fixtures/factories/testPayloadFactories";

const { profileService, documentService, setOnboardingCompletedMock } =
  vi.hoisted(() => ({
    profileService: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    documentService: {
      create: vi.fn(),
    },
    setOnboardingCompletedMock: vi.fn(),
  }));

vi.mock("@modules/profile", () => ({
  useProfile: () => ({ service: profileService }),
}));

vi.mock("@modules/documents", () => ({
  useDocument: () => ({ service: documentService }),
}));

vi.mock("@modules/settings", () => ({
  setOnboardingCompleted: setOnboardingCompletedMock,
}));

import {
  completeOnboarding,
  OnboardingRepository,
} from "@modules/onboarding/repositories/OnboardingRepository";

describe("OnboardingRepository", () => {
  beforeEach(() => {
    profileService.list.mockReset();
    profileService.create.mockReset();
    profileService.update.mockReset();
    documentService.create.mockReset();
    setOnboardingCompletedMock.mockReset();
  });

  it("creates a new profile, imports resume metadata, and marks onboarding complete", async () => {
    profileService.list.mockResolvedValue([]);
    profileService.create.mockResolvedValue(undefined);
    documentService.create.mockResolvedValue(undefined);
    setOnboardingCompletedMock.mockResolvedValue(undefined);

    const repository = new OnboardingRepository();
    await repository.complete({
      profile: buildUserProfile(),
      resumePath: "C:/Users/tudho/resume.docx",
      resumeMimeType: null,
    });

    expect(profileService.list).toHaveBeenCalledOnce();
    expect(profileService.create).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      linkedinUrl: "https://linkedin.com/in/jane-doe",
      githubUrl: "https://github.com/jane-doe",
      portfolioUrl: null,
      headline: "Frontend Engineer",
      summary: null,
      locationText: null,
      desiredSalary: 120000,
      salaryCurrency: "USD",
      preferredLocations: ["Berlin"],
      remotePreference: "flexible",
      skills: ["Vue", "TypeScript"],
      workEligibility: "EU",
      noticePeriodDays: 30,
      interviewAvailability: "Weekdays",
    });
    expect(profileService.update).not.toHaveBeenCalled();
    expect(documentService.create).toHaveBeenCalledWith({
      title: "resume.docx",
      kind: "resume",
      filePath: "C:/Users/tudho/resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: null,
      checksum: null,
    });
    expect(setOnboardingCompletedMock).toHaveBeenCalledWith(true);
  });

  it("updates the first existing profile and skips document creation when resumePath is missing", async () => {
    profileService.list.mockResolvedValue([
      { id: "550e8400-e29b-41d4-a716-446655440000" },
    ]);
    profileService.update.mockResolvedValue(undefined);
    setOnboardingCompletedMock.mockResolvedValue(undefined);

    await completeOnboarding({
      profile: buildUserProfile({
        email: "",
        linkedInUrl: "",
        githubUrl: "",
      }),
      resumePath: null,
    });

    expect(profileService.create).not.toHaveBeenCalled();
    expect(profileService.update).toHaveBeenCalledWith({
      id: "550e8400-e29b-41d4-a716-446655440000",
      fullName: "Jane Doe",
      email: null,
      phone: null,
      linkedinUrl: null,
      githubUrl: null,
      portfolioUrl: null,
      headline: "Frontend Engineer",
      summary: null,
      locationText: null,
      desiredSalary: 120000,
      salaryCurrency: "USD",
      preferredLocations: ["Berlin"],
      remotePreference: "flexible",
      skills: ["Vue", "TypeScript"],
      workEligibility: "EU",
      noticePeriodDays: 30,
      interviewAvailability: "Weekdays",
    });
    expect(documentService.create).not.toHaveBeenCalled();
    expect(setOnboardingCompletedMock).toHaveBeenCalledWith(true);
  });

  it("throws a validation error and stops before side effects when profile validation fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const repository = new OnboardingRepository();

      await expect(
        repository.complete({
          profile: buildUserProfile({ email: "invalid-email" }),
          resumePath: "C:/Users/tudho/resume.pdf",
        }),
      ).rejects.toBeInstanceOf(ValidationError);

      expect(profileService.list).not.toHaveBeenCalled();
      expect(profileService.create).not.toHaveBeenCalled();
      expect(profileService.update).not.toHaveBeenCalled();
      expect(documentService.create).not.toHaveBeenCalled();
      expect(setOnboardingCompletedMock).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
