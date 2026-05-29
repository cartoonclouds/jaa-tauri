/** SQL columns included in company repository text search. */
export const COMPANY_SEARCH_FIELDS = ["name", "location_text"] as const;

/**
 * Type alias for company search field.
 */
export type CompanySearchField = (typeof COMPANY_SEARCH_FIELDS)[number];

/** Client-side filter fields used in the companies datatable. */
export const companiesGlobalFilterFields: string[] = ["name", "locationText"];

/** Search input placeholder text for the companies datatable. */
export const companiesSearchPlaceholder = "Search companies";
