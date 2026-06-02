import type { IApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";

import { ApplicationService } from "@modules/applications/services/ApplicationService";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("ApplicationService location geocoding", () => {
  const mockedResolveLocationFields = vi.mocked(resolveLocationFields);

  const repository = {
    list: vi.fn(),
    listPage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as IApplicationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedResolveLocationFields.mockResolvedValue({
      locationText: "Ho Chi Minh City",
      locationLat: 10.5,
      locationLng: 106.7,
    });
  });

  it("resolves coordinates before create", async () => {
    const service = new ApplicationService(repository);

    await service.create({
      title: "Frontend Engineer",
      locationText: "Ho Chi Minh City",
      locationLat: null,
      locationLng: null,
    });

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Ho Chi Minh City",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Ho Chi Minh City",
        locationLat: 10.5,
        locationLng: 106.7,
      }),
    );
  });

  it("resolves coordinates before update when locationText is provided", async () => {
    const service = new ApplicationService(repository);

    await service.update({
      id: "app-1",
      title: "Frontend Engineer",
      locationText: "Da Nang",
      locationLat: null,
      locationLng: null,
      companyId: null,
      status: "saved",
      tagIds: [],
      priority: 0,
      isArchived: false,
    });

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Da Nang",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Ho Chi Minh City",
        locationLat: 10.5,
        locationLng: 106.7,
      }),
    );
  });
});
