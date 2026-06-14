import type {
  GlobalSearchDataset,
  GlobalSearchResultSections,
  GlobalSearchServiceContract,
  SearchCondition,
  SearchJoinMode,
} from "@modules/search/types";
import type {
  SemanticDocumentInput,
  SemanticSearchMatch,
  SemanticSearchServiceContract,
} from "@modules/search/types.semantic";

import {
  buildLocationRecords,
  getActiveConditions,
  toSearchText,
} from "@modules/search/utils/searchUtils";

import { ucwords } from "@/shared/utils/strings";

interface GlobalSearchServiceDependencies {
  applicationService: {
    list(): Promise<GlobalSearchDataset["applications"]>;
  };
  contactService: {
    list(): Promise<GlobalSearchDataset["contacts"]>;
  };
  companyService: {
    list(): Promise<GlobalSearchDataset["companies"]>;
  };
  semanticSearchService: SemanticSearchServiceContract;
}

/**
 * Orchestrates data loading and result shaping for global search.
 */
export class GlobalSearchService implements GlobalSearchServiceContract {
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

    const semanticDocuments: SemanticDocumentInput[] = [
      ...applications.map((application) => ({
        moduleKey: "applications",
        entityType: "application",
        entityId: application.id,
        title: toSearchText(application.title),
        content: [
          toSearchText(application.title),
          toSearchText(application.description),
          toSearchText(application.interviewProcess),
          toSearchText(application.benefits),
          toSearchText(application.locationText),
        ]
          .filter((value) => value.trim().length > 0)
          .join("\n"),
      })),
      ...contacts.map((contact) => ({
        moduleKey: "contacts",
        entityType: "contact",
        entityId: contact.id,
        title: toSearchText(contact.fullName),
        content: [
          toSearchText(contact.fullName),
          toSearchText(contact.email),
          toSearchText(contact.phone),
          toSearchText(contact.linkedinUrl),
          toSearchText(contact.locationText),
          toSearchText(contact.notes),
        ]
          .filter((value) => value.trim().length > 0)
          .join("\n"),
      })),
      ...companies.map((company) => ({
        moduleKey: "companies",
        entityType: "company",
        entityId: company.id,
        title: toSearchText(company.name),
        content: [
          toSearchText(company.name),
          toSearchText(company.industry),
          toSearchText(company.size),
          toSearchText(company.websiteUrl),
          toSearchText(company.linkedinUrl),
          toSearchText(company.locationText),
          toSearchText(company.notes),
        ]
          .filter((value) => value.trim().length > 0)
          .join("\n"),
      })),
      ...locations.map((location) => ({
        moduleKey: "locations",
        entityType: "location",
        entityId: location.id,
        title: toSearchText(location.locationText),
        content: [
          toSearchText(location.locationText),
          `Applications ${location.applicationCount.toString()}`,
          `Contacts ${location.contactCount.toString()}`,
          `Companies ${location.companyCount.toString()}`,
        ].join("\n"),
      })),
    ];

    await this.dependencies.semanticSearchService.upsertDocuments(
      semanticDocuments,
    );

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
  async buildResultSections(options: {
    dataset: GlobalSearchDataset;
    conditions: SearchCondition[];
    joinMode: SearchJoinMode;
  }): Promise<GlobalSearchResultSections> {
    const activeConditions = getActiveConditions(options.conditions);
    if (activeConditions.length === 0) {
      return {
        applications: [],
        contacts: [],
        companies: [],
        locations: [],
        totalCount: 0,
      };
    }

    const queryByScope = this.buildScopeQueries(
      activeConditions,
      options.joinMode,
    );

    const [
      applicationMatches,
      contactMatches,
      companyMatches,
      locationMatches,
    ] = await Promise.all([
      this.searchScope(
        "applications",
        "application",
        queryByScope.applications,
      ),
      this.searchScope("contacts", "contact", queryByScope.contacts),
      this.searchScope("companies", "company", queryByScope.companies),
      this.searchScope("locations", "location", queryByScope.locations),
    ]);

    const applicationsById = new Map(
      options.dataset.applications.map((application) => [
        application.id,
        application,
      ]),
    );
    const contactsById = new Map(
      options.dataset.contacts.map((contact) => [contact.id, contact]),
    );
    const companiesById = new Map(
      options.dataset.companies.map((company) => [company.id, company]),
    );
    const locationsById = new Map(
      options.dataset.locations.map((location) => [location.id, location]),
    );

    const applications = applicationMatches
      .map((match) => {
        const entry = applicationsById.get(match.entityId);
        if (!entry) {
          return null;
        }

        return {
          id: `application:${entry.id}`,
          entityType: "applications" as const,
          title: toSearchText(entry.title),
          subtitle: `Status: ${ucwords(toSearchText(entry.status))} | Event Flow: ${ucwords(toSearchText(entry.eventFlowStatus))}`,
          detail: toSearchText(entry.locationText) || null,
          targetId: entry.id,
          locationText: toSearchText(entry.locationText) || null,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const contacts = contactMatches
      .map((match) => {
        const entry = contactsById.get(match.entityId);
        if (!entry) {
          return null;
        }

        return {
          id: `contact:${entry.id}`,
          entityType: "contacts" as const,
          title: toSearchText(entry.fullName),
          subtitle: `Type: ${ucwords(toSearchText(entry.type))} | Email: ${toSearchText(entry.email) || "-"}`,
          detail: toSearchText(entry.locationText) || null,
          targetId: entry.id,
          locationText: toSearchText(entry.locationText) || null,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const companies = companyMatches
      .map((match) => {
        const entry = companiesById.get(match.entityId);
        if (!entry) {
          return null;
        }

        return {
          id: `company:${entry.id}`,
          entityType: "companies" as const,
          title: toSearchText(entry.name),
          subtitle: `Industry: ${ucwords(toSearchText(entry.industry)) || "-"} | Size: ${ucwords(toSearchText(entry.size)) || "-"}`,
          detail: toSearchText(entry.locationText) || null,
          targetId: entry.id,
          locationText: toSearchText(entry.locationText) || null,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const locations = locationMatches
      .map((match) => {
        const entry = locationsById.get(match.entityId);
        if (!entry) {
          return null;
        }

        return {
          id: entry.id,
          entityType: "locations" as const,
          title: entry.locationText ?? "",
          subtitle: `Applications: ${entry.applicationCount.toString()} | Contacts: ${entry.contactCount.toString()} | Companies: ${entry.companyCount.toString()}`,
          detail: "Filter applications by this location",
          targetId: null,
          locationText: entry.locationText,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

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

  private buildScopeQueries(
    conditions: SearchCondition[],
    joinMode: SearchJoinMode,
  ): Record<"applications" | "contacts" | "companies" | "locations", string> {
    const scopes: ("applications" | "contacts" | "companies" | "locations")[] =
      ["applications", "contacts", "companies", "locations"];

    const queries: Record<
      "applications" | "contacts" | "companies" | "locations",
      string
    > = {
      applications: "",
      contacts: "",
      companies: "",
      locations: "",
    };

    for (const scope of scopes) {
      const scopedValues = conditions
        .filter((condition) => condition.scope === scope)
        .map((condition) => condition.value.trim())
        .filter((value) => value.length > 0);

      if (scopedValues.length === 0) {
        continue;
      }

      const uniqueValues = Array.from(new Set(scopedValues));
      queries[scope] =
        joinMode === "all" ? uniqueValues.join(" ") : uniqueValues.join(" ");
    }

    return queries;
  }

  private async searchScope(
    moduleKey: string,
    entityType: string,
    query: string,
  ): Promise<SemanticSearchMatch[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    return this.dependencies.semanticSearchService.search({
      moduleKey,
      entityTypes: [entityType],
      query: trimmedQuery,
      limit: 50,
    });
  }
}
