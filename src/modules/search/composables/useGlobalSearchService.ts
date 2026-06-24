import type {
  GlobalSearchDataset,
  GlobalSearchResultSections,
  GlobalSearchServiceContract,
  SearchCondition,
  SearchJoinMode,
  SearchResult,
  SearchScope,
} from "@modules/search/types";
import type { SemanticSearchMatch } from "@modules/search/types.semantic";

import { useApplication } from "@modules/applications/composables/useApplication";
import { useCompany } from "@modules/companies/composables/useCompany";
import { useContact } from "@modules/contacts/composables/useContact";
import { useSemanticSearchService } from "@modules/search/composables/useSemanticSearchService";
import {
  buildLocationRecords,
  buildLocationSemanticSummary,
  filterEntriesByScope,
  getActiveConditions,
  joinSearchContent,
  toSearchText,
} from "@modules/search/utils/searchUtils";
import { showFailedPromiseToast } from "@shared/utils/toast";
import { useToast } from "primevue/usetoast";

import { ucwords } from "@/shared/utils/strings";

let globalSearchServiceInstance: GlobalSearchServiceContract | null = null;

/**
 * Returns a singleton global search service instance.
 */
export function useGlobalSearchService(): GlobalSearchServiceContract {
  if (globalSearchServiceInstance) {
    return globalSearchServiceInstance;
  }

  const { service: applicationService } = useApplication();
  const { service: contactService } = useContact();
  const { service: companyService } = useCompany();
  const semanticSearchService = useSemanticSearchService();
  const toast = useToast();

  async function fetchSearchDataset(): Promise<GlobalSearchDataset> {
    const [applicationsResult, contactsResult, companiesResult] =
      await Promise.allSettled([
        applicationService.list(),
        contactService.list(),
        companyService.list(),
      ]);

    if (applicationsResult.status === "rejected") {
      showFailedPromiseToast(
        toast,
        "Application search dataset",
        applicationsResult.reason,
      );
    }

    if (contactsResult.status === "rejected") {
      showFailedPromiseToast(
        toast,
        "Contact search dataset",
        contactsResult.reason,
      );
    }

    if (companiesResult.status === "rejected") {
      showFailedPromiseToast(
        toast,
        "Company search dataset",
        companiesResult.reason,
      );
    }

    const applications =
      applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
    const contacts =
      contactsResult.status === "fulfilled" ? contactsResult.value : [];
    const companies =
      companiesResult.status === "fulfilled" ? companiesResult.value : [];

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

  function isDatasetEmpty(dataset: GlobalSearchDataset): boolean {
    return (
      dataset.applications.length === 0 &&
      dataset.contacts.length === 0 &&
      dataset.companies.length === 0 &&
      dataset.locations.length === 0
    );
  }

  function mapApplicationResult(
    entry: GlobalSearchDataset["applications"][number],
  ): SearchResult {
    return {
      id: `application:${entry.id}`,
      entityType: "applications",
      title: toSearchText(entry.title),
      subtitle: `Status: ${ucwords(toSearchText(entry.status))} | Event Flow: ${ucwords(toSearchText(entry.eventFlowStatus))}`,
      detail: toSearchText(entry.locationText) || null,
      targetId: entry.id,
      locationText: toSearchText(entry.locationText) || null,
    };
  }

  function mapContactResult(
    entry: GlobalSearchDataset["contacts"][number],
  ): SearchResult {
    return {
      id: `contact:${entry.id}`,
      entityType: "contacts",
      title: toSearchText(entry.fullName),
      subtitle: `Type: ${ucwords(toSearchText(entry.type))} | Email: ${toSearchText(entry.email) || "-"}`,
      detail: toSearchText(entry.locationText) || null,
      targetId: entry.id,
      locationText: toSearchText(entry.locationText) || null,
    };
  }

  function mapCompanyResult(
    entry: GlobalSearchDataset["companies"][number],
  ): SearchResult {
    return {
      id: `company:${entry.id}`,
      entityType: "companies",
      title: toSearchText(entry.name),
      subtitle: `Industry: ${ucwords(toSearchText(entry.industry)) || "-"} | Size: ${ucwords(toSearchText(entry.size)) || "-"}`,
      detail: toSearchText(entry.locationText) || null,
      targetId: entry.id,
      locationText: toSearchText(entry.locationText) || null,
    };
  }

  function mapLocationResult(
    entry: GlobalSearchDataset["locations"][number],
  ): SearchResult {
    return {
      id: entry.id,
      entityType: "locations",
      title: entry.locationText ?? "",
      subtitle: `Applications: ${entry.applicationCount.toString()} | Contacts: ${entry.contactCount.toString()} | Companies: ${entry.companyCount.toString()}`,
      detail: "Filter applications by this location",
      targetId: null,
      locationText: entry.locationText,
    };
  }

  function mapSemanticMatchesToResults<TEntity extends { id: string }>(
    matches: SemanticSearchMatch[],
    byId: Map<string, TEntity>,
    projector: (entry: TEntity) => SearchResult,
  ): SearchResult[] {
    return matches
      .map((match) => {
        const entry = byId.get(match.entityId);
        return entry ? projector(entry) : null;
      })
      .filter((entry): entry is SearchResult => entry !== null);
  }

  function choosePrimaryOrFallback(
    primary: SearchResult[],
    fallback: SearchResult[],
  ): SearchResult[] {
    return primary.length > 0 ? primary : fallback;
  }

  function buildApplicationDocument(
    application: GlobalSearchDataset["applications"][number],
  ) {
    return {
      moduleKey: "applications" as const,
      entityType: "application" as const,
      entityId: application.id,
      title: toSearchText(application.title),
      content: joinSearchContent([
        application.title,
        application.description,
        application.interviewProcess,
        application.benefits,
        application.locationText,
      ]),
    };
  }

  function buildContactDocument(
    contact: GlobalSearchDataset["contacts"][number],
  ) {
    return {
      moduleKey: "contacts" as const,
      entityType: "contact" as const,
      entityId: contact.id,
      title: toSearchText(contact.fullName),
      content: joinSearchContent([
        contact.fullName,
        contact.email,
        contact.phone,
        contact.linkedinUrl,
        contact.locationText,
        contact.notes,
      ]),
    };
  }

  function buildCompanyDocument(
    company: GlobalSearchDataset["companies"][number],
  ) {
    return {
      moduleKey: "companies" as const,
      entityType: "company" as const,
      entityId: company.id,
      title: toSearchText(company.name),
      content: joinSearchContent([
        company.name,
        company.industry,
        company.size,
        company.websiteUrl,
        company.linkedinUrl,
        company.locationText,
        company.notes,
      ]),
    };
  }

  function buildLocationDocument(
    location: GlobalSearchDataset["locations"][number],
  ) {
    return {
      moduleKey: "locations" as const,
      entityType: "location" as const,
      entityId: location.id,
      title: toSearchText(location.locationText),
      content: joinSearchContent(buildLocationSemanticSummary(location)),
    };
  }

  globalSearchServiceInstance = {
    async loadDataset(): Promise<GlobalSearchDataset> {
      const { applications, contacts, companies, locations } =
        await fetchSearchDataset();

      try {
        await semanticSearchService.upsertDocuments([
          ...applications.map(buildApplicationDocument),
          ...contacts.map(buildContactDocument),
          ...companies.map(buildCompanyDocument),
          ...locations.map(buildLocationDocument),
        ]);
      } catch {
        // Keep dataset loading resilient; lexical fallback search still works.
      }

      return {
        applications,
        contacts,
        companies,
        locations,
      };
    },

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

      const dataset = isDatasetEmpty(options.dataset)
        ? await fetchSearchDataset()
        : options.dataset;

      const queryByScope = buildScopeQueries(
        activeConditions,
        options.joinMode,
      );

      const [
        applicationMatches,
        contactMatches,
        companyMatches,
        locationMatches,
      ] = await Promise.allSettled([
        searchScope("applications", "application", queryByScope.applications),
        searchScope("contacts", "contact", queryByScope.contacts),
        searchScope("companies", "company", queryByScope.companies),
        searchScope("locations", "location", queryByScope.locations),
      ]);

      if (applicationMatches.status === "rejected") {
        showFailedPromiseToast(
          toast,
          "Application semantic search",
          applicationMatches.reason,
        );
      }

      if (contactMatches.status === "rejected") {
        showFailedPromiseToast(
          toast,
          "Contact semantic search",
          contactMatches.reason,
        );
      }

      if (companyMatches.status === "rejected") {
        showFailedPromiseToast(
          toast,
          "Company semantic search",
          companyMatches.reason,
        );
      }

      if (locationMatches.status === "rejected") {
        showFailedPromiseToast(
          toast,
          "Location semantic search",
          locationMatches.reason,
        );
      }

      const applicationsById = new Map(
        dataset.applications.map((application) => [
          application.id,
          application,
        ]),
      );
      const contactsById = new Map(
        dataset.contacts.map((contact) => [contact.id, contact]),
      );
      const companiesById = new Map(
        dataset.companies.map((company) => [company.id, company]),
      );
      const locationsById = new Map(
        dataset.locations.map((location) => [location.id, location]),
      );

      const applications = mapSemanticMatchesToResults(
        applicationMatches.status === "fulfilled"
          ? applicationMatches.value
          : [],
        applicationsById,
        mapApplicationResult,
      );

      const contacts = mapSemanticMatchesToResults(
        contactMatches.status === "fulfilled" ? contactMatches.value : [],
        contactsById,
        mapContactResult,
      );

      const companies = mapSemanticMatchesToResults(
        companyMatches.status === "fulfilled" ? companyMatches.value : [],
        companiesById,
        mapCompanyResult,
      );

      const locations = mapSemanticMatchesToResults(
        locationMatches.status === "fulfilled" ? locationMatches.value : [],
        locationsById,
        mapLocationResult,
      );

      const fallbackApplications = filterEntriesByScope(
        "applications",
        dataset.applications,
        activeConditions,
        options.joinMode,
      ).map(mapApplicationResult);

      const fallbackContacts = filterEntriesByScope(
        "contacts",
        dataset.contacts,
        activeConditions,
        options.joinMode,
      ).map(mapContactResult);

      const fallbackCompanies = filterEntriesByScope(
        "companies",
        dataset.companies,
        activeConditions,
        options.joinMode,
      ).map(mapCompanyResult);

      const fallbackLocations = filterEntriesByScope(
        "locations",
        dataset.locations,
        activeConditions,
        options.joinMode,
      ).map(mapLocationResult);

      const finalApplications = choosePrimaryOrFallback(
        applications,
        fallbackApplications,
      );
      const finalContacts = choosePrimaryOrFallback(contacts, fallbackContacts);
      const finalCompanies = choosePrimaryOrFallback(
        companies,
        fallbackCompanies,
      );
      const finalLocations = choosePrimaryOrFallback(
        locations,
        fallbackLocations,
      );

      const totalCount =
        finalApplications.length +
        finalContacts.length +
        finalCompanies.length +
        finalLocations.length;

      return {
        applications: finalApplications,
        contacts: finalContacts,
        companies: finalCompanies,
        locations: finalLocations,
        totalCount,
      };
    },
  };

  function buildScopeQueries(
    conditions: SearchCondition[],
    _joinMode: SearchJoinMode,
  ): Record<SearchScope, string> {
    const scopes: SearchScope[] = [
      "applications",
      "contacts",
      "companies",
      "locations",
    ];

    const queries: Record<SearchScope, string> = {
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
      queries[scope] = uniqueValues.join(" ");
    }

    return queries;
  }

  async function searchScope(
    moduleKey: string,
    entityType: string,
    query: string,
  ): Promise<SemanticSearchMatch[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    return semanticSearchService.search({
      moduleKey,
      entityTypes: [entityType],
      query: trimmedQuery,
      limit: 50,
    });
  }

  return globalSearchServiceInstance;
}
