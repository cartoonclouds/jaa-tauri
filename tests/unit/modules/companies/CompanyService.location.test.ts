// eslint-disable-next-line no-restricted-imports
import { CompanyService } from "@modules/companies/services/CompanyService";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCompanyCreatePayload,
  buildCompanyUpdatePayload,
} from "../../../fixtures/factories/testPayloadFactories";
import { createCompanyRepositoryMock } from "../../../fixtures/factories/testRepositoryFactories";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("CompanyService location geocoding", () => {
  const mockedResolveLocationFields = vi.mocked(resolveLocationFields);
  const { repository, createMock, updateMock } = createCompanyRepositoryMock();

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

    await service.create(
      buildCompanyCreatePayload({
        name: "ACME",
        locationText: "Tokyo",
        locationLat: null,
        locationLng: null,
      }),
    );

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Tokyo",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Tokyo",
        locationLat: 35.6762,
        locationLng: 139.6503,
      }),
    );
  });

  it("resolves coordinates before update when locationText is provided", async () => {
    const service = new CompanyService(repository);

    await service.update(
      buildCompanyUpdatePayload({
        name: "ACME",
        locationText: "Tokyo",
        locationLat: null,
        locationLng: null,
      }),
    );

    expect(mockedResolveLocationFields).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Tokyo",
        locationLat: 35.6762,
        locationLng: 139.6503,
      }),
    );
  });
});
