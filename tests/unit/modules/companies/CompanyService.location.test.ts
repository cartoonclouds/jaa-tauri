import type { ICompanyRepository } from "@modules/companies/repositories/CompanyRepository";

import { CompanyService } from "@modules/companies/services/CompanyService";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("CompanyService location geocoding", () => {
  const mockedResolveLocationFields = vi.mocked(resolveLocationFields);

  const repository = {
    list: vi.fn(),
    listPage: vi.fn(),
    listAssociatedContacts: vi.fn(),
    listAssociatedApplications: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as ICompanyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedResolveLocationFields.mockResolvedValue({
      locationText: "Tokyo",
      locationLat: 35.6762,
      locationLng: 139.6503,
    });
  });

  it("resolves coordinates before create", async () => {
    const service = new CompanyService(repository);

    await service.create({
      name: "ACME",
      locationText: "Tokyo",
      locationLat: null,
      locationLng: null,
    });

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Tokyo",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Tokyo",
        locationLat: 35.6762,
        locationLng: 139.6503,
      }),
    );
  });

  it("resolves coordinates before update when locationText is provided", async () => {
    const service = new CompanyService(repository);

    await service.update({
      id: "company-1",
      name: "ACME",
      locationText: "Tokyo",
      locationLat: null,
      locationLng: null,
    });

    expect(mockedResolveLocationFields).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Tokyo",
        locationLat: 35.6762,
        locationLng: 139.6503,
      }),
    );
  });
});
