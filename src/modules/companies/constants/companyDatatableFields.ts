export const COMPANY_SEARCH_FIELDS = ["name", "location_text"] as const;

/**
 * Type alias for company search field.
 */
export type CompanySearchField = (typeof COMPANY_SEARCH_FIELDS)[number];








