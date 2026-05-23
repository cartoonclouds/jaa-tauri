/** Sort direction sent to repositories. */
export type DatatableSortOrder = "asc" | "desc";

/** PrimeVue sort direction payload value. */
export type DatatableSortOrderInput = 1 | -1 | 0 | null;

/** Active sort direction stored in table state. */
export type DatatableActiveSortOrder = 1 | -1 | null;

/**
 * Query parameters for paginated datatable requests.
 */
export interface DatatablePageQuery {
  /** Zero-based page index. */
  page: number;
  /** Number of rows requested per page. */
  rows: number;
  /** Optional search text applied to the page query. */
  search?: string;
  /** Optional DB column fields to search against (repository allowlist applied). */
  searchFields?: string[];
  /** Optional field used for sorting. */
  sortField?: string;
  /** Optional sort direction used for sorting. */
  sortOrder?: DatatableSortOrder;
}

/**
 * Standard paginated result shape returned by datatable fetchers.
 */
export interface DatatablePageResult<TItem> {
  /** Items for the current page. */
  items: TItem[];
  /** Total number of records available across all pages. */
  total: number;
}



