import type { Application } from "@modules/applications/domain/entities/Application";
import type { SemanticSearchServiceContract } from "@modules/search";

import {
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import { ApplicationSemanticSearchService } from "@modules/applications/services/ApplicationSemanticSearchService";
import { describe, expect, it, vi } from "vitest";

function createApplication(overrides: Partial<Application>): Application {
  const now = new Date("2026-06-14T00:00:00.000Z");

  return {
    id: "app-1",
    companyId: "company-1",
    title: "Frontend Engineer",
    sourceUrl: null,
    appliedAt: now,
    locationText: "London",
    locationLat: null,
    locationLng: null,
    attendanceType: null,
    employmentType: null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    description: "Vue, Nuxt and desktop app role",
    interviewProcess: null,
    benefits: null,
    tagIds: [],
    priority: 3,
    isArchived: false,
    status: ApplicationStatus.Applied,
    eventFlowStatus: ApplicationEventFlowStatus.Applied,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("application semantic search service", () => {
  it("indexes applications into semantic documents", async () => {
    const upsertDocuments = vi.fn().mockResolvedValue(undefined);
    const semanticSearchService: SemanticSearchServiceContract = {
      upsertDocuments,
      removeDocumentByEntity: vi.fn(),
      search: vi.fn().mockResolvedValue([]),
    };

    const service = new ApplicationSemanticSearchService({
      semanticSearchService,
      loadApplications: async () => [
        createApplication({ id: "app-1", companyId: "company-1" }),
      ],
      loadCompanies: async () => [{ id: "company-1", name: "Acme Ltd" }],
    });

    await service.rebuildIndex();

    expect(upsertDocuments).toHaveBeenCalledOnce();
    expect(upsertDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "applications",
          entityType: "application",
          entityId: "app-1",
          title: "Frontend Engineer",
        }),
      ]),
    );
  });

  it("searches similar applications and excludes current application", async () => {
    const semanticSearchService: SemanticSearchServiceContract = {
      upsertDocuments: vi.fn(),
      removeDocumentByEntity: vi.fn(),
      search: vi.fn().mockResolvedValue([
        {
          documentId: "d1",
          moduleKey: "applications",
          entityType: "application",
          entityId: "app-1",
          title: "Frontend Engineer",
          content: "match one",
          metadata: { companyName: "Acme" },
          similarity: 0.99,
          distance: 0.01,
        },
        {
          documentId: "d2",
          moduleKey: "applications",
          entityType: "application",
          entityId: "app-2",
          title: "Senior Vue Engineer",
          content: "match two",
          metadata: { companyName: "Beta" },
          similarity: 0.91,
          distance: 0.09,
        },
      ]),
    };

    const service = new ApplicationSemanticSearchService({
      semanticSearchService,
      loadApplications: async () => [
        createApplication({ id: "app-1", companyId: "company-1" }),
        createApplication({
          id: "app-2",
          companyId: "company-2",
          title: "Senior Vue Engineer",
        }),
      ],
      loadCompanies: async () => [
        { id: "company-1", name: "Acme Ltd" },
        { id: "company-2", name: "Beta Co" },
      ],
    });

    const matches = await service.searchSimilarToApplication("app-1", {
      limit: 5,
    });

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      applicationId: "app-2",
      title: "Senior Vue Engineer",
    });
  });
});
