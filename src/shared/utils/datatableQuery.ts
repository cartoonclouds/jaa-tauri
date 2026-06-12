import type { QueryBindings } from "@/services/database/QueryBindings";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  DatatableSortOrder,
} from "@shared/types";

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
 * Defines the minimal database surface required by datatable helpers.
 */
export interface DatatableSelectDriver {
  select<T = unknown>(sql: string, bindings?: QueryBindings): Promise<T[]>;
}

/**
 * Defines shared datatable page fetch options.
 */
export interface FetchDatatablePageOptions<TItem> {
  tableName: string;
  orderByClause: string;
  query: DatatablePageQuery;
  searchFields: readonly string[];
  mapRow: (row: Record<string, unknown>) => TItem | Promise<TItem>;
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

/**
 * Fetch a paginated datatable result set using a shared search/count/query flow.
 */
export async function fetchDatatablePage<TItem>(
  db: DatatableSelectDriver,
  {
    tableName,
    orderByClause,
    query,
    searchFields,
    mapRow,
  }: FetchDatatablePageOptions<TItem>,
): Promise<DatatablePageResult<TItem>> {
  const { hasSearch, page, rows, search } = normalizeDatatablePageQuery(query);
  const activeSearchFields = resolveSearchFields(
    searchFields,
    query.searchFields,
  );
  const searchWhereClause = buildSearchWhereClause(activeSearchFields);
  const searchBindings = [`%${search}%`] satisfies QueryBindings;

  const totalRows = hasSearch
    ? await db.select<{ total: number }>(
        `SELECT COUNT(*) AS total
         FROM ${tableName}
         WHERE ${searchWhereClause}`,
        searchBindings,
      )
    : await db.select<{ total: number }>(
        `SELECT COUNT(*) AS total FROM ${tableName}`,
      );

  const listRows = hasSearch
    ? await db.select<Record<string, unknown>>(
        `${buildSelectAllOrderedQuery({
          tableName,
          orderByClause,
          whereClause: searchWhereClause,
        })}
         LIMIT $2
         OFFSET $3`,
        [searchBindings[0], rows, page * rows],
      )
    : await db.select<Record<string, unknown>>(
        `${buildSelectAllOrderedQuery({ tableName, orderByClause })}
         LIMIT $1
         OFFSET $2`,
        [rows, page * rows],
      );

  return {
    items: await Promise.all(listRows.map((row) => mapRow(row))),
    total: totalRows[0]?.total ?? 0,
  };
}
