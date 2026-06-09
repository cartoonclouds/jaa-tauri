import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { IApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import type { ICompanyRepository } from "@modules/companies/types";
import type { IContactRepository } from "@modules/contacts/repositories/ContactRepository";
import type { IDocumentRepository } from "@modules/documents/types";
import type { IEventRepository } from "@modules/events/types";
import type { INotificationRepository } from "@modules/notifications/types";
import type { IProfileRepository } from "@modules/profile/types";
import type { ISettingRepository } from "@modules/settings/types";
import type { IStatisticRepository } from "@modules/statistics/types";
import type { ITagRepository } from "@modules/tags/types";

import { vi } from "vitest";

interface CrudRepositoryMockBase {
  list: ReturnType<typeof vi.fn>;
  listPage: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

/** Build a shared CRUD repository mock base and extend it per module. */
function createCrudRepositoryMockBase(): CrudRepositoryMockBase {
  return {
    list: vi.fn(),
    listPage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

/** Build a mocked database driver for statistics executable tests. */
export function createDatabaseDriverMock(): {
  driver: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn();
  const executeMock = vi.fn();
  const transactionMock = vi.fn();

  const driver: DatabaseDriver = {
    name: "mock-db",
    select: selectMock,
    execute: executeMock,
    transaction: transactionMock,
  };

  return {
    driver,
    selectMock,
    executeMock,
    transactionMock,
  };
}

/** Build a mocked application repository and expose key method spies. */
export function createApplicationRepositoryMock(): {
  repository: IApplicationRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const repository: IApplicationRepository = {
    list: base.list as unknown as IApplicationRepository["list"],
    listPage: base.listPage as unknown as IApplicationRepository["listPage"],
    create: base.create as unknown as IApplicationRepository["create"],
    update: base.update as unknown as IApplicationRepository["update"],
    delete: base.delete as unknown as IApplicationRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked company repository and expose key method spies. */
export function createCompanyRepositoryMock(): {
  repository: ICompanyRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  listAssociatedContactsMock: ReturnType<typeof vi.fn>;
  listAssociatedApplicationsMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const listAssociatedContactsMock = vi.fn();
  const listAssociatedApplicationsMock = vi.fn();
  const repository: ICompanyRepository = {
    list: base.list as unknown as ICompanyRepository["list"],
    listPage: base.listPage as unknown as ICompanyRepository["listPage"],
    listAssociatedContacts: listAssociatedContactsMock,
    listAssociatedApplications: listAssociatedApplicationsMock,
    create: base.create as unknown as ICompanyRepository["create"],
    update: base.update as unknown as ICompanyRepository["update"],
    delete: base.delete as unknown as ICompanyRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    listAssociatedContactsMock,
    listAssociatedApplicationsMock,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked contact repository and expose key method spies. */
export function createContactRepositoryMock(): {
  repository: IContactRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  listByApplicationIdMock: ReturnType<typeof vi.fn>;
  listAssociatedCompaniesMock: ReturnType<typeof vi.fn>;
  linkToApplicationMock: ReturnType<typeof vi.fn>;
  unlinkFromApplicationMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const listByApplicationIdMock = vi.fn();
  const listAssociatedCompaniesMock = vi.fn();
  const linkToApplicationMock = vi.fn();
  const unlinkFromApplicationMock = vi.fn();
  const repository: IContactRepository = {
    list: base.list as unknown as IContactRepository["list"],
    listPage: base.listPage as unknown as IContactRepository["listPage"],
    listByApplicationId: listByApplicationIdMock,
    listAssociatedCompanies: listAssociatedCompaniesMock,
    linkToApplication: linkToApplicationMock,
    unlinkFromApplication: unlinkFromApplicationMock,
    create: base.create as unknown as IContactRepository["create"],
    update: base.update as unknown as IContactRepository["update"],
    delete: base.delete as unknown as IContactRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    listByApplicationIdMock,
    listAssociatedCompaniesMock,
    linkToApplicationMock,
    unlinkFromApplicationMock,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked document repository and expose key method spies. */
export function createDocumentRepositoryMock(): {
  repository: IDocumentRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  listByApplicationIdMock: ReturnType<typeof vi.fn>;
  linkToApplicationMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const listByApplicationIdMock = vi.fn();
  const linkToApplicationMock = vi.fn();
  const repository: IDocumentRepository = {
    list: base.list as unknown as IDocumentRepository["list"],
    listPage: base.listPage as unknown as IDocumentRepository["listPage"],
    listByApplicationId: listByApplicationIdMock,
    linkToApplication: linkToApplicationMock,
    create: base.create as unknown as IDocumentRepository["create"],
    update: base.update as unknown as IDocumentRepository["update"],
    delete: base.delete as unknown as IDocumentRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    listByApplicationIdMock,
    linkToApplicationMock,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked event repository and expose key method spies. */
export function createEventRepositoryMock(): {
  repository: IEventRepository;
  listMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const repository: IEventRepository = {
    list: base.list as unknown as IEventRepository["list"],
    create: base.create as unknown as IEventRepository["create"],
    update: base.update as unknown as IEventRepository["update"],
    delete: base.delete as unknown as IEventRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked notification repository and expose key method spies. */
export function createNotificationRepositoryMock(): {
  repository: INotificationRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const repository: INotificationRepository = {
    list: base.list as unknown as INotificationRepository["list"],
    listPage: base.listPage as unknown as INotificationRepository["listPage"],
    create: base.create as unknown as INotificationRepository["create"],
    update: base.update as unknown as INotificationRepository["update"],
    delete: base.delete as unknown as INotificationRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked profile repository and expose key method spies. */
export function createProfileRepositoryMock(): {
  repository: IProfileRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const repository: IProfileRepository = {
    list: base.list as unknown as IProfileRepository["list"],
    get: vi.fn(),
    listPage: base.listPage as unknown as IProfileRepository["listPage"],
    create: base.create as unknown as IProfileRepository["create"],
    update: base.update as unknown as IProfileRepository["update"],
    delete: base.delete as unknown as IProfileRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}

/** Build a mocked setting repository and expose key method spies. */
export function createSettingRepositoryMock(): {
  repository: ISettingRepository;
} {
  const base = createCrudRepositoryMockBase();
  const repository: ISettingRepository = {
    list: base.list as unknown as ISettingRepository["list"],
    listPage: base.listPage as unknown as ISettingRepository["listPage"],
    get: vi.fn(),
    upsert: vi.fn(),
    getConstantRow: vi.fn(),
    listConstantRows: vi.fn(),
    upsertConstantRow: vi.fn(),
    deleteConstantRow: vi.fn(),
    create: base.create as unknown as ISettingRepository["create"],
    update: base.update as unknown as ISettingRepository["update"],
    delete: base.delete as unknown as ISettingRepository["delete"],
  };

  return { repository };
}

/** Build a mocked statistic repository and expose key method spies. */
export function createStatisticRepositoryMock(): {
  repository: IStatisticRepository;
  getOverviewMock: ReturnType<typeof vi.fn>;
} {
  const getOverviewMock = vi.fn();
  const repository: IStatisticRepository = {
    list: vi.fn(),
    getOverview: getOverviewMock,
  };

  return {
    repository,
    getOverviewMock,
  };
}

/** Build a mocked tag repository and expose key method spies. */
export function createTagRepositoryMock(): {
  repository: ITagRepository;
  listMock: ReturnType<typeof vi.fn>;
  listPageMock: ReturnType<typeof vi.fn>;
  createMock: ReturnType<typeof vi.fn>;
  updateMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
} {
  const base = createCrudRepositoryMockBase();
  const repository: ITagRepository = {
    list: base.list as unknown as ITagRepository["list"],
    listPage: base.listPage as unknown as ITagRepository["listPage"],
    listByModelType: vi.fn(),
    create: base.create as unknown as ITagRepository["create"],
    update: base.update as unknown as ITagRepository["update"],
    delete: base.delete as unknown as ITagRepository["delete"],
  };

  return {
    repository,
    listMock: base.list,
    listPageMock: base.listPage,
    createMock: base.create,
    updateMock: base.update,
    deleteMock: base.delete,
  };
}
