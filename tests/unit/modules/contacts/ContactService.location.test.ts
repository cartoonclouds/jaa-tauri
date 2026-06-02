import type { IContactRepository } from "@modules/contacts/repositories/ContactRepository";

import { ContactService } from "@modules/contacts/services/ContactService";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@shared/utils/geocoding", () => ({
  resolveLocationFields: vi.fn(),
}));

describe("ContactService location geocoding", () => {
  const mockedResolveLocationFields = vi.mocked(resolveLocationFields);

  const repository = {
    list: vi.fn(),
    listPage: vi.fn(),
    listByApplicationId: vi.fn(),
    listAssociatedCompanies: vi.fn(),
    linkToApplication: vi.fn(),
    unlinkFromApplication: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as IContactRepository;

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

    await service.create({
      companyId: null,
      fullName: "Jane Doe",
      type: "recruiter",
      email: null,
      phone: null,
      linkedinUrl: null,
      locationText: "Singapore",
      locationLat: null,
      locationLng: null,
      notes: null,
    });

    expect(mockedResolveLocationFields).toHaveBeenCalledWith({
      locationText: "Singapore",
      currentLatitude: null,
      currentLongitude: null,
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Singapore",
        locationLat: 1.3521,
        locationLng: 103.8198,
      }),
    );
  });

  it("resolves coordinates before update when locationText is provided", async () => {
    const service = new ContactService(repository);

    await service.update({
      id: "contact-1",
      locationText: "Singapore",
      locationLat: null,
      locationLng: null,
    });

    expect(mockedResolveLocationFields).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        locationText: "Singapore",
        locationLat: 1.3521,
        locationLng: 103.8198,
      }),
    );
  });
});
