import { ValidationError } from "@shared/domain/errors";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildApplicationCreatePayload,
  buildApplicationUpdatePayload,
} from "../../../fixtures/factories/testPayloadFactories";
import { createApplicationRepositoryMock } from "../../../fixtures/factories/testRepositoryFactories";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("application service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveLocationFields).mockResolvedValue({
      locationText: "London",
      locationLat: 51.5072,
      locationLng: -0.1276,
    });
  });

  it("delegates list and listPage to the repository", async () => {
    const { ApplicationService } =
      await import("../../../../src/modules/applications/services/ApplicationService");
    const { repository, listMock, listPageMock } =
      createApplicationRepositoryMock();
    const service = new ApplicationService(repository);
    const query = { page: 2, rows: 25, search: "frontend" };

    await service.list();
    await service.listPage(query);

    expect(listMock).toHaveBeenCalledOnce();
    expect(listPageMock).toHaveBeenCalledWith(query);
  });

  it("validates and geocodes creation before persisting", async () => {
    const { ApplicationService } =
      await import("../../../../src/modules/applications/services/ApplicationService");
    const { repository, createMock } = createApplicationRepositoryMock();
    createMock.mockResolvedValue("app-1");
    const service = new ApplicationService(repository);

    await expect(
      service.create(
        buildApplicationCreatePayload({
          title: "Frontend Engineer",
          locationText: " London ",
          locationLat: 10,
          locationLng: 20,
        }),
      ),
    ).resolves.toBe("app-1");

    expect(resolveLocationFields).toHaveBeenCalledWith({
      locationText: " London ",
      currentLatitude: 10,
      currentLongitude: 20,
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Engineer",
        locationText: "London",
        locationLat: 51.5072,
        locationLng: -0.1276,
      }),
    );
  });

  it("rejects invalid creation payloads", async () => {
    const { ApplicationService } =
      await import("../../../../src/modules/applications/services/ApplicationService");
    const { repository, createMock } = createApplicationRepositoryMock();
    const service = new ApplicationService(repository);

    await expect(
      service.create(buildApplicationCreatePayload({ title: "" })),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("updates directly when location text is unchanged and geocodes otherwise", async () => {
    const { ApplicationService } =
      await import("../../../../src/modules/applications/services/ApplicationService");
    const { repository, updateMock } = createApplicationRepositoryMock();
    updateMock.mockResolvedValue(undefined);
    const service = new ApplicationService(repository);

    await service.update(
      buildApplicationUpdatePayload({
        locationText: undefined,
        title: "Senior Frontend Engineer",
      }),
    );

    expect(resolveLocationFields).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Senior Frontend Engineer" }),
    );

    await service.update(
      buildApplicationUpdatePayload({
        locationText: " Berlin ",
        locationLat: 1,
        locationLng: 2,
      }),
    );

    expect(resolveLocationFields).toHaveBeenCalledWith({
      locationText: " Berlin ",
      currentLatitude: 1,
      currentLongitude: 2,
    });
    expect(updateMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        locationText: "London",
        locationLat: 51.5072,
        locationLng: -0.1276,
      }),
    );
  });

  it("rejects invalid updates and delegates delete", async () => {
    const { ApplicationService } =
      await import("../../../../src/modules/applications/services/ApplicationService");
    const { repository, updateMock, deleteMock } =
      createApplicationRepositoryMock();
    const service = new ApplicationService(repository);

    await expect(
      service.update(buildApplicationUpdatePayload({ title: "" })),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(updateMock).not.toHaveBeenCalled();

    await service.delete("app-1");
    expect(deleteMock).toHaveBeenCalledWith("app-1");
  });
});
