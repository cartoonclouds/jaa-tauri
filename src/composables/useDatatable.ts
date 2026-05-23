import { FilterMatchMode } from "@primevue/core/api";
import { ref } from "vue";

import { DEFAULT_DATATABLE_PAGINATOR_TEMPLATE } from "@/shared/utils/datatableQuery";

/**
 * Configuration for the client-side datatable composable.
 */
interface UseDatatableOptions {
  /** Fields used by the global text filter. */
  globalFilterFields: string[];
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
}

/**
 * Create a local datatable state bundle with client-side filtering helpers.
 */
export function useDatatable(options: UseDatatableOptions) {
  const globalFilter = ref(options.initialGlobalFilter ?? "");
  const filters = ref({
    global: {
      value: options.initialGlobalFilter ?? "",
      matchMode: FilterMatchMode.CONTAINS,
    },
  });

  const rows = ref(options.rows ?? 10);
  const rowsPerPageOptions = options.rowsPerPageOptions ?? [10, 20, 50];
  const paginatorTemplate =
    options.paginatorTemplate ?? DEFAULT_DATATABLE_PAGINATOR_TEMPLATE;
  const currentPageReportTemplate =
    options.currentPageReportTemplate ?? "{first} to {last} of {totalRecords}";

  function onGlobalFilterInput(value: string): void {
    globalFilter.value = value;
    filters.value.global.value = value;
  }

  function resetDatatableState(): void {
    onGlobalFilterInput("");
  }

  return {
    currentPageReportTemplate,
    filters,
    globalFilter,
    globalFilterFields: options.globalFilterFields,
    onGlobalFilterInput,
    paginatorTemplate,
    resetDatatableState,
    rows,
    rowsPerPageOptions,
  };
}
