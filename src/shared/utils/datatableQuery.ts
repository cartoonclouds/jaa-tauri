import type { DatatablePageQuery, DatatableSortOrder } from "@shared/types";

/** Default ORDER BY clause used by datatable-backed list queries. */
export const DEFAULT_CREATED_AT_ORDER_BY = "created_at DESC" as const;

/** Shared table min-width style applied to PrimeVue datatables. */
export const DEFAULT_DATATABLE_TABLE_STYLE = "min-width: 50rem";

/** Shared paginator template used across datatable pages. */
export const DEFAULT_DATATABLE_PAGINATOR_TEMPLATE =
  "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown";

/**
 * Defines build select all ordered query options.
 */
export interface BuildSelectAllOrderedQueryOptions {
  tableName: string;
  orderByClause: string;
  whereClause?: string;
}

/**
 * Defines normalized datatable page query.
 */
export interface NormalizedDatatablePageQuery {
  rows: number;
  page: number;
  search: string;
  hasSearch: boolean;
}

/**
 * Defines resolve order by clause options.
 */
export interface ResolveOrderByClauseOptions {
  sortField?: string;
  sortOrder?: DatatableSortOrder;
  sortableColumns?: Readonly<Record<string, string>>;
  fallbackClause: string;
}

/**
 * Normalize incoming page query values.
 */
export function normalizeDatatablePageQuery(
  query: DatatablePageQuery,
): NormalizedDatatablePageQuery {
  const rows = Math.max(1, query.rows);
  const page = Math.max(0, query.page);
  const search = query.search?.trim() ?? "";

  return {
    rows,
    page,
    search,
    hasSearch: search.length > 0,
  };
}

/**
 * Resolve active search fields from an allowlist and optional user selection.
 */
export function resolveSearchFields(
  allowedFields: readonly string[],
  requestedFields?: string[],
): string[] {
  const allowedSet = new Set<string>(allowedFields);
  const requested = (requestedFields ?? []).filter((field) =>
    allowedSet.has(field),
  );

  return requested.length > 0 ? requested : [...allowedFields];
}

/**
 * Build a SQL LIKE-clause expression joined by OR.
 */
export function buildSearchWhereClause(
  searchFields: readonly string[],
  placeholder = "$1",
): string {
  return searchFields
    .map((field) => `${field} LIKE ${placeholder}`)
    .join(" OR ");
}

/**
 * Resolve ORDER BY clause from safe sortable columns and query sort settings.
 */
export function resolveOrderByClause({
  sortField,
  sortOrder,
  sortableColumns,
  fallbackClause,
}: ResolveOrderByClauseOptions): string {
  if (!sortField || !sortableColumns) {
    return fallbackClause;
  }

  const column = sortableColumns[sortField];
  if (!column) {
    return fallbackClause;
  }

  const direction = sortOrder === "asc" ? "ASC" : "DESC";
  return `${column} ${direction}`;
}

/**
 * Build a SELECT * query with optional WHERE and ORDER BY clauses.
 * Note: table and where clauses should come from trusted code paths.
 */
export function buildSelectAllOrderedQuery({
  tableName,
  orderByClause,
  whereClause,
}: BuildSelectAllOrderedQueryOptions): string {
  const whereSegment = whereClause ? ` WHERE ${whereClause}` : "";
  return `SELECT * FROM ${tableName}${whereSegment} ORDER BY ${orderByClause}`;
}
