import { FilterMatchMode } from "@primevue/core/api";
import { ref } from "vue";

interface UseDatatableOptions {
  globalFilterFields: string[];
  initialGlobalFilter?: string;
  rows?: number;
  rowsPerPageOptions?: number[];
  paginatorTemplate?: string;
  currentPageReportTemplate?: string;
}

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
    options.paginatorTemplate ??
    "RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink";
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
