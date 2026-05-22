import type {
  DatatableActiveSortOrder,
  DatatablePageQuery,
  DatatablePageResult,
  DatatableSortOrderInput,
} from "@shared/types";

import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Configuration for the server-backed datatable composable.
 */
interface UseServerDatatableOptions<TItem> {
  /** Function used to fetch a single page of data from the server. */
  fetchPage: (query: DatatablePageQuery) => Promise<DatatablePageResult<TItem>>;
  /** Optional DB fields used for server-side search matching. */
  searchFields?: string[];
  /** Initial value applied to the global filter. */
  initialGlobalFilter?: string;
  /** Initial page size. */
  rows?: number;
  /** Available page size options. */
  rowsPerPageOptions?: number[];
  /** PrimeVue paginator template string. */
  paginatorTemplate?: string;
  /** PrimeVue page report template string. */
  currentPageReportTemplate?: string;
  /** Debounce delay applied to global search input. */
  searchDebounceMs?: number;
}

/**
 * Page change payload emitted by the datatable component.
 */
interface DatatablePageEvent {
  /** Zero-based page index. */
  page?: number;
  /** Rows requested for the page. */
  rows?: number;
}

/**
 * Sort payload emitted by the datatable component.
 */
interface DatatableSortEvent {
  /** Field selected for sorting. */
  sortField?: string | null;
  /** Sort direction: 1=asc, -1=desc, 0/null=none. */
  sortOrder?: DatatableSortOrderInput;
}

/**
 * Create datatable state that fetches pages from the server.
 */
export function useServerDatatable<
  TItem,
  TSearchField extends string = string,
  TSortField extends string = string,
>(
  options: Omit<UseServerDatatableOptions<TItem>, "searchFields"> & {
    searchFields?: TSearchField[];
  },
) {
  const searchFields = ref<TSearchField[]>([...(options.searchFields ?? [])]);
  const rows = ref(options.rows ?? 10);
  const page = ref(0);
  const totalRecords = ref(0);
  const globalFilter = ref(options.initialGlobalFilter ?? "");
  const items = ref<TItem[]>([]);
  const isLoading = ref(false);
  const sortField = ref<TSortField | null>(null);
  const sortOrder = ref<DatatableActiveSortOrder>(null);

  const rowsPerPageOptions = options.rowsPerPageOptions ?? [10, 20, 50];
  const paginatorTemplate =
    options.paginatorTemplate ??
    "RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink";
  const currentPageReportTemplate =
    options.currentPageReportTemplate ?? "{first} to {last} of {totalRecords}";

  const searchDebounceMs = Math.max(0, options.searchDebounceMs ?? 300);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  async function refresh(): Promise<void> {
    isLoading.value = true;

    try {
      const requestSortField: string | undefined =
        sortField.value === null ? undefined : String(sortField.value);

      const result = await options.fetchPage({
        page: page.value,
        rows: rows.value,
        search: globalFilter.value.trim() || undefined,
        searchFields:
          searchFields.value.length > 0 ? searchFields.value : undefined,
        sortField: requestSortField,
        sortOrder:
          sortOrder.value === 1
            ? "asc"
            : sortOrder.value === -1
              ? "desc"
              : undefined,
      });

      items.value = result.items;
      totalRecords.value = result.total;
    } finally {
      isLoading.value = false;
    }
  }

  function clearSearchTimeout(): void {
    if (searchTimeout !== null) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  }

  function onGlobalFilterInput(value: string): void {
    globalFilter.value = value;
    page.value = 0;

    clearSearchTimeout();
    searchTimeout = setTimeout(() => {
      void refresh();
    }, searchDebounceMs);
  }

  function onPage(event: DatatablePageEvent): void {
    page.value = event.page ?? page.value;
    rows.value = event.rows ?? rows.value;
    void refresh();
  }

  function onSearchFieldsChange(fields: TSearchField[]): void {
    searchFields.value = [...fields];
    page.value = 0;
    void refresh();
  }

  function onSort(
    event: DatatableSortEvent & { sortField?: TSortField | null },
  ): void {
    sortField.value = event.sortField ?? null;
    sortOrder.value =
      event.sortOrder === 1 || event.sortOrder === -1 ? event.sortOrder : null;
    page.value = 0;
    void refresh();
  }

  function setSort(
    field: TSortField | null,
    order: DatatableSortOrderInput,
  ): void {
    sortField.value = field;
    sortOrder.value = order === 1 || order === -1 ? order : null;
    page.value = 0;
    void refresh();
  }

  onMounted(() => {
    void refresh();
  });

  onBeforeUnmount(() => {
    clearSearchTimeout();
  });

  return {
    currentPageReportTemplate,
    globalFilter,
    items,
    isLoading,
    onGlobalFilterInput,
    onPage,
    onSearchFieldsChange,
    onSort,
    setSort,
    page,
    paginatorTemplate,
    refresh,
    rows,
    rowsPerPageOptions,
    searchFields,
    sortField,
    sortOrder,
    totalRecords,
  };
}
