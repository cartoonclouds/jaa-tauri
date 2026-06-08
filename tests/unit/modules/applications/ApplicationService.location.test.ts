// eslint-disable-next-line no-restricted-imports
import { ApplicationService } from "@modules/applications/services/ApplicationService";
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

describe("ApplicationService location geocoding", () => {
  const mockedResolveLocationFields = vi.mocked(resolveLocationFields);
  const { repository, createMock, updateMock } =
    createApplicationRepositoryMock();

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

    await service.create(
      buildApplicationCreatePayload({
        locationText: "Ho Chi Minh City",
        locationLat: null,
        locationLng: null,
      }),
    );

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Ho Chi Minh City",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Ho Chi Minh City",
        locationLat: 10.5,
        locationLng: 106.7,
      }),
    );
  });

  it("resolves coordinates before update when locationText is provided", async () => {
    const service = new ApplicationService(repository);

    await service.update(
      buildApplicationUpdatePayload({
        locationText: "Da Nang",
        locationLat: null,
        locationLng: null,
        priority: 0,
      }),
    );

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Da Nang",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Ho Chi Minh City",
        locationLat: 10.5,
        locationLng: 106.7,
      }),
    );
  });
});
