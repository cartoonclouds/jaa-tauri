// eslint-disable-next-line no-restricted-imports
import { ContactService } from "@modules/contacts/services/ContactService";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildContactCreatePayload,
  buildContactUpdatePayload,
} from "../../../fixtures/factories/testPayloadFactories";
import { createContactRepositoryMock } from "../../../fixtures/factories/testRepositoryFactories";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("ContactService location geocoding", () => {
  const mockedResolveLocationFields = vi.mocked(resolveLocationFields);
  const { repository, createMock, updateMock } = createContactRepositoryMock();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedResolveLocationFields.mockResolvedValue({
      locationText: "Singapore",
      locationLat: 1.3521,
      locationLng: 103.8198,
    });
  });

  it("resolves coordinates before create", async () => {
    const service = new ContactService(repository);

    await service.create(
      buildContactCreatePayload({
        fullName: "Jane Doe",
        type: "recruiter",
        locationText: "Singapore",
        locationLat: null,
        locationLng: null,
      }),
    );

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Singapore",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Singapore",
        locationLat: 1.3521,
        locationLng: 103.8198,
      }),
    );
  });

  it("resolves coordinates before update when locationText is provided", async () => {
    const service = new ContactService(repository);

    await service.update(
      buildContactUpdatePayload({
        locationText: "Singapore",
        locationLat: null,
        locationLng: null,
      }),
    );

    expect(mockedResolveLocationFields).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Singapore",
        locationLat: 1.3521,
        locationLng: 103.8198,
      }),
    );
  });
});
