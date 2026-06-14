import type { SearchResult } from "@modules/search/types";

/**
 * Handlers used to open entities from search results.
 */
export interface SearchResultOpenHandlers {
  applications: (applicationId: string) => Promise<void> | void;
  contacts: (contactId: string) => Promise<void> | void;
  companies: (companyId: string) => Promise<void> | void;
  locations?: (locationText: string) => Promise<void> | void;
}

/**
 * Opens a search result using entity-specific handler callbacks.
 */
export async function openSearchResult(
  result: SearchResult,
  handlers: SearchResultOpenHandlers,
): Promise<void> {
  if (result.entityType === "applications" && result.targetId) {
    await handlers.applications(result.targetId);
    return;
  }

  if (result.entityType === "contacts" && result.targetId) {
    await handlers.contacts(result.targetId);
    return;
  }

  if (result.entityType === "companies" && result.targetId) {
    await handlers.companies(result.targetId);
    return;
  }

  if (
    result.entityType === "locations" &&
    result.locationText &&
    handlers.locations
  ) {
    await handlers.locations(result.locationText);
  }
}
