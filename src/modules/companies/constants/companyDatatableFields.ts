export const COMPANY_SEARCH_FIELDS = ["name", "location_text"] as const;

export type CompanySearchField = (typeof COMPANY_SEARCH_FIELDS)[number];
