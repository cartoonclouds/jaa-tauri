import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import { ValidationError } from "@shared/domain/errors";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCompanyCreatePayload,
  buildCompanyUpdatePayload,
  buildContactCreatePayload,
  buildContactUpdatePayload,
  buildDocumentCreatePayload,
  buildEventCreatePayload,
  buildEventUpdatePayload,
  buildNotificationCreatePayload,
  buildProfileCreatePayload,
  buildTagCreatePayload,
} from "../../fixtures/factories/testPayloadFactories";
import {
  createCompanyRepositoryMock,
  createContactRepositoryMock,
  createDocumentRepositoryMock,
  createEventRepositoryMock,
  createNotificationRepositoryMock,
  createProfileRepositoryMock,
  createStatisticRepositoryMock,
  createTagRepositoryMock,
} from "../../fixtures/factories/testRepositoryFactories";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("module services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveLocationFields).mockResolvedValue({
      locationText: "Resolved City",
      locationLat: 10,
      locationLng: 20,
    });
  });

  it("covers company service delegation, geocoding, and validation", async () => {
    const { CompanyService } =
      await import("../../../src/modules/companies/services/CompanyService");
    const {
      repository,
      listMock,
      listPageMock,
      listAssociatedContactsMock,
      listAssociatedApplicationsMock,
      createMock,
      updateMock,
      deleteMock,
    } = createCompanyRepositoryMock();
    createMock.mockResolvedValue("company-1");
    const service = new CompanyService(repository);
    const pageQuery = { page: 1, rows: 10, search: "acme" };

    await service.list();
    await service.listPage(pageQuery);
    await service.listAssociatedContacts("company-1");
    await service.listAssociatedApplications("company-1");
    await service.create(
      buildCompanyCreatePayload({ locationText: " London " }),
    );
    await service.update(
      buildCompanyUpdatePayload({ name: "Acme 2", locationText: undefined }),
    );
    await service.update(
      buildCompanyUpdatePayload({ locationText: " Berlin " }),
    );
    await service.delete("company-1");

    expect(listMock).toHaveBeenCalledOnce();
    expect(listPageMock).toHaveBeenCalledWith(pageQuery);
    expect(listAssociatedContactsMock).toHaveBeenCalledWith("company-1");
    expect(listAssociatedApplicationsMock).toHaveBeenCalledWith("company-1");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Resolved City",
        locationLat: 10,
        locationLng: 20,
      }),
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ name: "Acme 2", locationText: undefined }),
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ locationText: "Resolved City" }),
    );
    expect(deleteMock).toHaveBeenCalledWith("company-1");

    await expect(
      service.create(buildCompanyCreatePayload({ name: "" })),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      service.update(buildCompanyUpdatePayload({ name: "" })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("covers contact service delegation, application linking, geocoding, and validation", async () => {
    const { ContactService } =
      await import("../../../src/modules/contacts/services/ContactService");
    const {
      repository,
      listMock,
      listPageMock,
      listByApplicationIdMock,
      listAssociatedCompaniesMock,
      linkToApplicationMock,
      unlinkFromApplicationMock,
      createMock,
      updateMock,
      deleteMock,
    } = createContactRepositoryMock();
    createMock.mockResolvedValue("contact-1");
    const service = new ContactService(repository);
    const pageQuery = { page: 3, rows: 25, search: "jane" };

    await service.list();
    await service.listPage(pageQuery);
    await service.listByApplicationId("app-1");
    await service.listAssociatedCompanies("contact-1");
    await service.linkToApplication("app-1", "contact-1");
    await service.unlinkFromApplication("app-1", "contact-1");
    await service.create(
      buildContactCreatePayload({ locationText: " London " }),
    );
    await service.update(
      buildContactUpdatePayload({
        fullName: "Jane 2",
        locationText: undefined,
      }),
    );
    await service.update(
      buildContactUpdatePayload({ locationText: " Berlin " }),
    );
    await service.delete("contact-1");

    expect(listMock).toHaveBeenCalledOnce();
    expect(listPageMock).toHaveBeenCalledWith(pageQuery);
    expect(listByApplicationIdMock).toHaveBeenCalledWith("app-1");
    expect(listAssociatedCompaniesMock).toHaveBeenCalledWith("contact-1");
    expect(linkToApplicationMock).toHaveBeenCalledWith("app-1", "contact-1");
    expect(unlinkFromApplicationMock).toHaveBeenCalledWith(
      "app-1",
      "contact-1",
    );
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ locationText: "Resolved City" }),
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ fullName: "Jane 2" }),
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ locationText: "Resolved City" }),
    );
    expect(deleteMock).toHaveBeenCalledWith("contact-1");

    await expect(
      service.create(buildContactCreatePayload({ fullName: "" })),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      service.update(buildContactUpdatePayload({ type: "invalid" as never })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("covers document service delegation and validation", async () => {
    const { DocumentService } =
      await import("../../../src/modules/documents/services/DocumentService");
    const {
      repository,
      listByApplicationIdMock,
      linkToApplicationMock,
      createMock,
      updateMock,
      deleteMock,
    } = createDocumentRepositoryMock();
    createMock.mockResolvedValue("document-1");
    const service = new DocumentService(repository);
    const pageQuery = { page: 1, rows: 5, search: "cv" };

    await service.list();
    await service.listPage(pageQuery);
    await service.listByApplicationId("app-1");
    await service.linkToApplication("app-1", "document-1");
    await service.linkToApplication("app-1", "document-1", "resume");
    await service.create(buildDocumentCreatePayload());
    await service.update({ id: "document-1", title: "Updated CV" });
    await service.delete("document-1");

    expect(listByApplicationIdMock).toHaveBeenCalledWith("app-1");
    expect(linkToApplicationMock).toHaveBeenNthCalledWith(
      1,
      "app-1",
      "document-1",
      "attachment",
    );
    expect(linkToApplicationMock).toHaveBeenNthCalledWith(
      2,
      "app-1",
      "document-1",
      "resume",
    );
    expect(createMock).toHaveBeenCalledOnce();
    expect(updateMock).toHaveBeenCalledWith({
      id: "document-1",
      title: "Updated CV",
    });
    expect(deleteMock).toHaveBeenCalledWith("document-1");

    expect(() =>
      service.create(buildDocumentCreatePayload({ title: "" })),
    ).toThrow(ValidationError);
    expect(() => service.update({ id: "document-1", filePath: "" })).toThrow(
      ValidationError,
    );
  });

  it("covers event service delegation and validation", async () => {
    const { EventService } =
      await import("../../../src/modules/events/services/EventService");
    const { repository, listMock, createMock, updateMock, deleteMock } =
      createEventRepositoryMock();
    createMock.mockResolvedValue("event-1");
    const service = new EventService(repository);

    await service.list();
    await service.create(buildEventCreatePayload());
    await service.update(buildEventUpdatePayload({ title: "Updated title" }));
    await service.update(buildEventUpdatePayload());
    await service.delete("event-1");

    expect(listMock).toHaveBeenCalledOnce();
    expect(createMock).toHaveBeenCalledOnce();
    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(deleteMock).toHaveBeenCalledWith("event-1");

    expect(() =>
      service.create(buildEventCreatePayload({ title: "" })),
    ).toThrow(ValidationError);
    expect(() =>
      service.update(buildEventUpdatePayload({ eventAt: "not-a-date" })),
    ).toThrow(ValidationError);
  });

  it("covers notification service trimming, validation, and delegation", async () => {
    const { NotificationService } =
      await import("../../../src/modules/notifications/services/NotificationService");
    const {
      repository,
      listMock,
      listPageMock,
      createMock,
      updateMock,
      deleteMock,
    } = createNotificationRepositoryMock();
    createMock.mockResolvedValue("notification-1");
    const service = new NotificationService(repository);
    const pageQuery = { page: 2, rows: 20, search: "reminder" };

    await service.list();
    await service.listPage(pageQuery);
    await service.create(
      buildNotificationCreatePayload({
        title: "  Reminder  ",
        body: "  Follow up  ",
      }),
    );
    await service.update({ id: "note-1", title: "  Updated  " });
    await service.delete("note-1");

    expect(listMock).toHaveBeenCalledOnce();
    expect(listPageMock).toHaveBeenCalledWith(pageQuery);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Reminder", body: "Follow up" }),
    );
    expect(updateMock).toHaveBeenCalledWith({ id: "note-1", title: "Updated" });
    expect(deleteMock).toHaveBeenCalledWith("note-1");

    expect(() =>
      service.create(buildNotificationCreatePayload({ title: "   " })),
    ).toThrow(ValidationError);
  });

  it("covers profile service trimming, validation, and delegation", async () => {
    const { ProfileService } =
      await import("../../../src/modules/profile/services/ProfileService");
    const {
      repository,
      listMock,
      listPageMock,
      createMock,
      updateMock,
      deleteMock,
    } = createProfileRepositoryMock();
    createMock.mockResolvedValue("profile-1");
    const service = new ProfileService(repository);
    const pageQuery = { page: 1, rows: 50, search: "john" };

    await service.list();
    await service.listPage(pageQuery);
    await service.create(
      buildProfileCreatePayload({ fullName: "  John Doe  " }),
    );
    await service.update({ id: "profile-1", fullName: "  Jane Doe  " });
    await service.update({ id: "profile-1" });
    await service.delete("profile-1");

    expect(listMock).toHaveBeenCalledOnce();
    expect(listPageMock).toHaveBeenCalledWith(pageQuery);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "John Doe" }),
    );
    expect(updateMock).toHaveBeenNthCalledWith(1, {
      id: "profile-1",
      fullName: "Jane Doe",
    });
    expect(updateMock).toHaveBeenNthCalledWith(2, {
      id: "profile-1",
      fullName: undefined,
    });
    expect(deleteMock).toHaveBeenCalledWith("profile-1");

    expect(() =>
      service.create(buildProfileCreatePayload({ fullName: "   " })),
    ).toThrow(ValidationError);
  });

  it("covers tag service trimming, validation, and delegation", async () => {
    const { TagService } =
      await import("../../../src/modules/tags/services/TagService");
    const {
      repository,
      listMock,
      listPageMock,
      createMock,
      updateMock,
      deleteMock,
    } = createTagRepositoryMock();
    createMock.mockResolvedValue("tag-1");
    const service = new TagService(repository);
    const pageQuery = { page: 1, rows: 20, search: "urgent" };

    await service.list();
    await service.listPage(pageQuery);
    await service.create(buildTagCreatePayload({ name: "  urgent  " }));
    await service.update({
      id: "tag-1",
      name: "  backlog  ",
      modelType: TagModelType.General,
    });
    await service.update({ id: "tag-1" });
    await service.delete("tag-1");

    expect(listMock).toHaveBeenCalledOnce();
    expect(listPageMock).toHaveBeenCalledWith(pageQuery);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "urgent" }),
    );
    expect(updateMock).toHaveBeenNthCalledWith(1, {
      id: "tag-1",
      name: "backlog",
      modelType: TagModelType.General,
    });
    expect(updateMock).toHaveBeenNthCalledWith(2, {
      id: "tag-1",
      name: undefined,
    });
    expect(deleteMock).toHaveBeenCalledWith("tag-1");

    expect(() =>
      service.create(buildTagCreatePayload({ name: "   " })),
    ).toThrow(ValidationError);
  });

  it("covers statistic service overview delegation", async () => {
    const { StatisticService } =
      await import("../../../src/modules/statistics/services/StatisticService");
    const { repository, getOverviewMock } = createStatisticRepositoryMock();
    const service = new StatisticService(repository);
    const metrics = [{ id: "total", label: "Total", value: 1 }];
    getOverviewMock.mockResolvedValue(metrics);

    await expect(service.getOverview()).resolves.toEqual(metrics);
    expect(getOverviewMock).toHaveBeenCalledOnce();
  });
});
