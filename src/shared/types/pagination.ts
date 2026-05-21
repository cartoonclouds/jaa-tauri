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
