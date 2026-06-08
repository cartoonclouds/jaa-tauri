import type { IApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import type { ICompanyRepository } from "@modules/companies/types";
import type { IContactRepository } from "@modules/contacts/repositories/ContactRepository";

import { vi } from "vitest";

/** Build a mocked application repository and expose key method spies. */
export function createApplicationRepositoryMock(): {
  repository: IApplicationRepository;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
} {
  const createMock = vi.fn();
  const updateMock = vi.fn();
  const repository: IApplicationRepository = {
    list: vi.fn(),
    listPage: vi.fn(),
    create: createMock,
    update: updateMock,
    delete: vi.fn(),
  };

  return {
    repository,
    createMock,
    updateMock,
  };
}

/** Build a mocked company repository and expose key method spies. */
export function createCompanyRepositoryMock(): {
  repository: ICompanyRepository;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
} {
  const createMock = vi.fn();
  const updateMock = vi.fn();
  const repository: ICompanyRepository = {
    list: vi.fn(),
    listPage: vi.fn(),
    listAssociatedContacts: vi.fn(),
    listAssociatedApplications: vi.fn(),
    create: createMock,
    update: updateMock,
    delete: vi.fn(),
  };

  return {
    repository,
    createMock,
    updateMock,
  };
}

/** Build a mocked contact repository and expose key method spies. */
export function createContactRepositoryMock(): {
  repository: IContactRepository;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
} {
  const createMock = vi.fn();
  const updateMock = vi.fn();
  const repository: IContactRepository = {
    list: vi.fn(),
    listPage: vi.fn(),
    listByApplicationId: vi.fn(),
    listAssociatedCompanies: vi.fn(),
    linkToApplication: vi.fn(),
    unlinkFromApplication: vi.fn(),
    create: createMock,
    update: updateMock,
    delete: vi.fn(),
  };

  return {
    repository,
    createMock,
    updateMock,
  };
}
