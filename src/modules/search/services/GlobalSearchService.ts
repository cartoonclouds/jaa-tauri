import type { ApplicationService } from "@modules/applications/services/ApplicationService";
import type { CompanyService } from "@modules/companies/services/CompanyService";
import type { ContactService } from "@modules/contacts/services/ContactService";
import type {
  GlobalSearchDataset,
  GlobalSearchResultSections,
  SearchCondition,
  SearchJoinMode,
} from "@modules/search/types";

import {
  buildLocationRecords,
  filterEntriesByScope,
  getActiveConditions,
  toSearchText,
} from "@modules/search/utils/searchUtils";

interface GlobalSearchServiceDependencies {
  applicationService: ApplicationService;
  contactService: ContactService;
  companyService: CompanyService;
}

/**
 * Orchestrates data loading and result shaping for global search.
 */
export class GlobalSearchService {
  constructor(private readonly dependencies: GlobalSearchServiceDependencies) {}

  /**
   * Loads search datasets across supported entities.
   */
  async loadDataset(): Promise<GlobalSearchDataset> {
    const [applications, contacts, companies] = await Promise.all([
      this.dependencies.applicationService.list(),
      this.dependencies.contactService.list(),
      this.dependencies.companyService.list(),
    ]);

    const locations = buildLocationRecords({
      applications,
      contacts,
      companies,
    });

    return {
      applications,
      contacts,
      companies,
      locations,
    };
  }

  /**
   * Builds all result sections from dataset and current conditions.
   */
  buildResultSections(options: {
    dataset: GlobalSearchDataset;
    conditions: SearchCondition[];
    joinMode: SearchJoinMode;
  }): GlobalSearchResultSections {
    const activeConditions = getActiveConditions(options.conditions);

    const applications = filterEntriesByScope(
      "applications",
      options.dataset.applications,
      activeConditions,
      options.joinMode,
    ).map((entry) => ({
      id: `application:${entry.id}`,
      entityType: "applications" as const,
      title: toSearchText(entry.title),
      subtitle: `Status: ${toSearchText(entry.status)} | Event Flow: ${toSearchText(entry.eventFlowStatus)}`,
      detail: toSearchText(entry.locationText) || null,
      targetId: entry.id,
      locationText: toSearchText(entry.locationText) || null,
    }));

    const contacts = filterEntriesByScope(
      "contacts",
      options.dataset.contacts,
      activeConditions,
      options.joinMode,
    ).map((entry) => ({
      id: `contact:${entry.id}`,
      entityType: "contacts" as const,
      title: toSearchText(entry.fullName),
      subtitle: `Type: ${toSearchText(entry.type)} | Email: ${toSearchText(entry.email) || "-"}`,
      detail: toSearchText(entry.locationText) || null,
      targetId: entry.id,
      locationText: toSearchText(entry.locationText) || null,
    }));

    const companies = filterEntriesByScope(
      "companies",
      options.dataset.companies,
      activeConditions,
      options.joinMode,
    ).map((entry) => ({
      id: `company:${entry.id}`,
      entityType: "companies" as const,
      title: toSearchText(entry.name),
      subtitle: `Industry: ${toSearchText(entry.industry) || "-"} | Size: ${toSearchText(entry.size) || "-"}`,
      detail: toSearchText(entry.locationText) || null,
      targetId: entry.id,
      locationText: toSearchText(entry.locationText) || null,
    }));

    const locations = filterEntriesByScope(
      "locations",
      options.dataset.locations,
      activeConditions,
      options.joinMode,
    ).map((entry) => ({
      id: entry.id,
      entityType: "locations" as const,
      title: entry.locationText,
      subtitle: `Applications: ${entry.applicationCount.toString()} | Contacts: ${entry.contactCount.toString()} | Companies: ${entry.companyCount.toString()}`,
      detail: "Filter applications by this location",
      targetId: null,
      locationText: entry.locationText,
    }));

    const totalCount =
      applications.length +
      contacts.length +
      companies.length +
      locations.length;

    return {
      applications,
      contacts,
      companies,
      locations,
      totalCount,
    };
  }
}
