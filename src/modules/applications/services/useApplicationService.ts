import type { DatabaseDriver } from "~/services/database/DatabaseDriver";

import { useNuxtApp } from "nuxt/app";

import { ApplicationService } from "./ApplicationService";

export function useApplicationService() {
  const { $database } = useNuxtApp() as { $database: DatabaseDriver };
  return new ApplicationService($database);
}
