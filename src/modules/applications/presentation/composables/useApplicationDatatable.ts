import { useDatatable } from "@/composables/useDatatable";

const GLOBAL_FILTER_FIELDS: string[] = [
  "title",
  "status",
  "locationText",
  "priority",
];

export function useApplicationDatatable() {
  return useDatatable({
    globalFilterFields: GLOBAL_FILTER_FIELDS,
  });
}
